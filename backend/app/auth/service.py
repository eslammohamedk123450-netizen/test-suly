"""Authentication and credit-ledger services."""
import hashlib
import hmac
import secrets
from datetime import date, datetime, timedelta, timezone
from typing import Optional
from zoneinfo import ZoneInfo

import jwt
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.models.admin import CreditTransaction, RevokedToken
from backend.app.db.models.user import User

CAIRO_TZ = ZoneInfo("Africa/Cairo")
DAILY_CREDIT_AMOUNT = 200
REGISTRATION_CREDIT_AMOUNT = 1000


def hash_password(password: str, salt: Optional[bytes] = None) -> tuple[str, str]:
    salt = salt or secrets.token_bytes(16)
    derived = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1).hex()
    salt_hex = salt.hex()
    return f"scrypt$n=16384$r=8$p=1${salt_hex}${derived}", salt_hex


def verify_password(password: str, hashed_password: str, _salt_unused: str = "") -> bool:
    try:
        parts = hashed_password.split("$")
        stored_hash = parts[-1]
        salt = bytes.fromhex(parts[4])
        derived = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1).hex()
        return hmac.compare_digest(derived, stored_hash)
    except (ValueError, IndexError):
        return False


def _secret() -> str:
    if not settings.secret_key:
        raise RuntimeError("SECRET_KEY is not configured")
    return settings.secret_key


def generate_token(user_id: int, is_admin: bool = False, session_version: int = 1) -> str:
    now = datetime.now(timezone.utc)
    expiry_seconds = settings.admin_token_expire_seconds if is_admin else settings.auth_token_expire_seconds
    payload = {
        "sub": str(user_id),
        "kind": "admin" if is_admin else "user",
        "session_version": session_version,
        "jti": secrets.token_urlsafe(24),
        "iat": now,
        "exp": now + timedelta(seconds=expiry_seconds),
    }
    return jwt.encode(payload, _secret(), algorithm="HS256")


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, _secret(), algorithms=["HS256"])
    except (jwt.PyJWTError, RuntimeError):
        return None


def token_identifier(token: str, payload: Optional[dict] = None) -> str:
    claims = payload or decode_token(token) or {}
    return str(claims.get("jti") or hashlib.sha256(token.encode("utf-8")).hexdigest())


def verify_token(token: str, require_admin: bool = False) -> Optional[int]:
    try:
        payload = decode_token(token)
        if payload is None:
            return None
        if require_admin and payload.get("kind") != "admin":
            return None
        return int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        return None


def _as_utc(value: datetime) -> datetime:
    """Normalize DB datetimes; SQLite may return naive timestamps."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def cairo_date(value: datetime) -> date:
    return _as_utc(value).astimezone(CAIRO_TZ).date()


def next_cairo_midnight(now: Optional[datetime] = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    local_now = _as_utc(now).astimezone(CAIRO_TZ)
    next_day = local_now.date() + timedelta(days=1)
    return datetime.combine(next_day, datetime.min.time(), tzinfo=CAIRO_TZ).astimezone(timezone.utc)


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(
        self,
        email: str,
        password: str,
        full_name: Optional[str],
        *,
        grant_welcome_credits: bool = True,
    ) -> User:
        normalized_email = email.strip().lower()
        existing = self.db.execute(
            select(User).where(User.email == normalized_email)
        ).scalar_one_or_none()
        if existing:
            raise ValueError("A user with this email already exists.")

        hashed_pw, _ = hash_password(password)
        user = User(
            email=normalized_email,
            full_name=full_name.strip() if full_name and full_name.strip() else None,
            is_active=True,
            is_admin=False,
            credit_balance=0,
            hashed_password=hashed_pw,
        )
        try:
            self.db.add(user)
            self.db.flush()
            if grant_welcome_credits:
                user.credit_balance = REGISTRATION_CREDIT_AMOUNT
                self.db.add(
                    CreditTransaction(
                        user_id=user.id,
                        amount=REGISTRATION_CREDIT_AMOUNT,
                        balance_after=REGISTRATION_CREDIT_AMOUNT,
                        reason="registration_bonus",
                        idempotency_key=f"registration:{user.id}",
                    )
                )
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ValueError("A user with this email already exists.") from exc
        self.db.refresh(user)
        return user

    def login(self, email: str, password: str, admin_only: bool = False) -> tuple[User, str]:
        normalized_email = email.strip().lower()
        user = self.db.query(User).filter(User.email == normalized_email).first()
        if not user or not user.is_active or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password.")
        if admin_only and not user.is_admin:
            raise ValueError("Administrator access required.")
        # Lazy fallback keeps the first authenticated request after midnight reliable
        # even if the scheduled Supabase job is delayed or temporarily unavailable.
        self.award_daily_bonus(user)
        return user, generate_token(user.id, is_admin=user.is_admin, session_version=user.session_version)

    def has_daily_bonus_today(self, user: User, now: Optional[datetime] = None) -> bool:
        now = now or datetime.now(timezone.utc)
        today = cairo_date(now)
        key = f"daily_bonus:{user.id}:{today.isoformat()}"
        existing = self.db.execute(
            select(CreditTransaction.id).where(CreditTransaction.idempotency_key == key)
        ).scalar_one_or_none()
        if existing is not None:
            return True

        # Support old ledger rows created before idempotency keys were added.
        last_legacy = self.db.execute(
            select(CreditTransaction.created_at)
            .where(
                CreditTransaction.user_id == user.id,
                CreditTransaction.reason == "daily_bonus",
                CreditTransaction.idempotency_key.is_(None),
            )
            .order_by(CreditTransaction.created_at.desc())
            .limit(1)
        ).scalar_one_or_none()
        return last_legacy is not None and cairo_date(last_legacy) == today

    def award_daily_bonus(self, user: User, now: Optional[datetime] = None) -> bool:
        """Award 200 credits once per Cairo day, starting the day after signup.

        The unique idempotency key is the final concurrency guard. The balance
        update and ledger insert are in one transaction, so a duplicate request
        cannot leave a second balance increment behind.
        """
        if not user.is_active or user.is_admin:
            return False
        now = now or datetime.now(timezone.utc)
        today = cairo_date(now)
        created_at = user.created_at or now
        if cairo_date(created_at) >= today:
            return False

        key = f"daily_bonus:{user.id}:{today.isoformat()}"
        if self.has_daily_bonus_today(user, now):
            return False

        updated_balance = self.db.execute(
            update(User)
            .where(
                User.id == user.id,
                User.is_active.is_(True),
                User.is_admin.is_(False),
            )
            .values(credit_balance=User.credit_balance + DAILY_CREDIT_AMOUNT)
            .returning(User.credit_balance)
        ).scalar_one_or_none()
        if updated_balance is None:
            self.db.rollback()
            return False

        user.credit_balance = updated_balance
        self.db.add(
            CreditTransaction(
                user_id=user.id,
                amount=DAILY_CREDIT_AMOUNT,
                balance_after=updated_balance,
                reason="daily_bonus",
                idempotency_key=key,
            )
        )
        try:
            self.db.commit()
            return True
        except IntegrityError:
            # Another request/job won the same user/day key. Roll back the paired
            # balance increment as well as the duplicate ledger insert.
            self.db.rollback()
            return False

    def get_current_user(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found.")
        if not user.is_active:
            raise ValueError("User is inactive.")
        return user

    def logout(self, user_id: int, token: str) -> bool:
        payload = decode_token(token)
        if not payload or int(payload.get("sub", 0)) != user_id:
            return False
        token_id = token_identifier(token, payload)
        expires_at = payload.get("exp")
        if not expires_at:
            return False
        existing = self.db.query(RevokedToken).filter(RevokedToken.token_id == token_id).first()
        if not existing:
            self.db.add(
                RevokedToken(
                    token_id=token_id,
                    expires_at=datetime.fromtimestamp(float(expires_at), timezone.utc),
                )
            )
            self.db.commit()
        return True

    def change_password(self, user: User, current_password: str, new_password: str) -> None:
        if not verify_password(current_password, user.hashed_password):
            raise ValueError("Current password is incorrect.")
        if len(new_password) < 8:
            raise ValueError("New password must be at least 8 characters long.")
        user.hashed_password = hash_password(new_password)[0]
        user.session_version += 1
        self.db.commit()

    def revoke_all_sessions(self, user: User) -> None:
        user.session_version += 1
        self.db.commit()

    def delete_account(self, user: User, password: str) -> None:
        if not verify_password(password, user.hashed_password):
            raise ValueError("Password is incorrect.")
        user.is_active = False
        user.session_version += 1
        self.db.commit()
