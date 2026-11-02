"""Authentication services with scrypt password hashing and signed JWTs."""
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.models.user import User


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


def generate_token(user_id: int, is_admin: bool = False) -> str:
    now = datetime.now(timezone.utc)
    expiry_seconds = settings.admin_token_expire_seconds if is_admin else settings.auth_token_expire_seconds
    payload = {
        "sub": str(user_id),
        "kind": "admin" if is_admin else "user",
        "iat": now,
        "exp": now + timedelta(seconds=expiry_seconds),
    }
    return jwt.encode(payload, _secret(), algorithm="HS256")


def verify_token(token: str, require_admin: bool = False) -> Optional[int]:
    try:
        payload = jwt.decode(token, _secret(), algorithms=["HS256"])
        if require_admin and payload.get("kind") != "admin":
            return None
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError, RuntimeError):
        return None


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, email: str, password: str, full_name: Optional[str]) -> User:
        if self.db.query(User).filter(User.email == email).first():
            raise ValueError("A user with this email already exists.")
        hashed_pw, _ = hash_password(password)
        user = User(email=email, full_name=full_name, is_active=True, is_admin=False, credit_balance=0, hashed_password=hashed_pw)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def login(self, email: str, password: str, admin_only: bool = False) -> tuple[User, str]:
        user = self.db.query(User).filter(User.email == email).first()
        if not user or not user.is_active or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password.")
        if admin_only and not user.is_admin:
            raise ValueError("Administrator access required.")
        return user, generate_token(user.id, is_admin=user.is_admin)

    def get_current_user(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found.")
        if not user.is_active:
            raise ValueError("User is inactive.")
        return user

    def logout(self, _user_id: int) -> bool:
        # JWTs are short-lived; server-side revocation is a documented next step.
        return True
