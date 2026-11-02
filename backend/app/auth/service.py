"""Authentication service layer.

Provides business logic for:
- Password hashing and verification
- Token generation and validation
- User registration
- User login
- User retrieval
- Logout (session invalidation)

All sensitive operations are isolated from API routes here.
"""

import hashlib
import hmac
import secrets
import time
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from backend.app.auth.schemas import (
    CurrentUserResponse,
    LoginRequest,
    RegisterRequest,
)
from backend.app.core.config import settings

from backend.app.db.models.user import User


# ---------------------------------------------------------------------------
# Password hashing (built-in hashlib — no external package required)
# Note: For production, replace with bcrypt or argon2
# ---------------------------------------------------------------------------


def hash_password(password: str, salt: Optional[bytes] = None) -> tuple[str, str]:
    """Hash a password using scrypt with a random salt.

    Returns a tuple of (encoded_string, salt_hex_string).
    encoded_string format: scrypt$n=16384$r=8$p=1$salt_hex$hash_hex
    """
    if salt is None:
        salt = secrets.token_bytes(16)
    password_bytes = password.encode("utf-8")
    hashed = hashlib.scrypt(password_bytes, salt=salt, n=2**14, r=8, p=1).hex()
    salt_hex = salt.hex()
    encoded = f"scrypt$n=16384$r=8$p=1${salt_hex}${hashed}"
    return encoded, salt_hex


def verify_password(
    password: str, hashed_password: str, salt_b64: str
) -> bool:
    """Verify a password against a stored scrypt hash.

    hashed_password format: scrypt$n=16384$r=8$p=1$salt_hex$hash_hex
    """
    try:
        parts = hashed_password.split("$")
        stored_hash = parts[-1]
        salt = bytes.fromhex(parts[4])
        password_bytes = password.encode("utf-8")
        new_hash = hashlib.scrypt(password_bytes, salt=salt, n=2**14, r=8, p=1).hex()
        return hmac.compare_digest(new_hash, stored_hash)
    except (ValueError, IndexError):
        return False


# ---------------------------------------------------------------------------
# Token generation (simple bearer token — no external package required)
# Note: For production, replace with JWT using PyJWT library
# ---------------------------------------------------------------------------


def generate_token(user_id: int) -> str:
    """Generate an HMAC-SHA256 signed bearer token for a user."""
    now = int(time.time())
    payload = f"{user_id}:{now}"
    signature = hmac.new(
        settings.secret_key.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    return f"{payload}:{signature}"


def verify_token(token: str) -> Optional[int]:
    """Verify an HMAC-SHA256 signed token and extract user ID. Returns None if invalid."""
    if not token:
        return None
    try:
        payload, signature = token.rsplit(":", 1)
        expected_sig = hmac.new(
            settings.secret_key.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        user_id_str, timestamp_str = payload.split(":")
        user_id = int(user_id_str)
        timestamp = int(timestamp_str)
        if int(time.time()) - timestamp > settings.auth_token_expire_seconds:
            return None
        return user_id
    except (ValueError, IndexError):
        return None


# ---------------------------------------------------------------------------
# Auth Service
# ---------------------------------------------------------------------------


class AuthService:
    """Service for authentication operations."""

    def __init__(self, db: Session):
        self.db = db

    def register(self, email: str, password: str, full_name: Optional[str]) -> User:
        """Register a new user.

        Raises:
            ValueError: If user with email already exists.
        """
        existing = self.db.query(User).filter(User.email == email).first()
        if existing:
            raise ValueError("A user with this email already exists.")

        hashed_pw, _ = hash_password(password)

        user = User(
            email=email,
            full_name=full_name,
            is_active=True,
            hashed_password=hashed_pw,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def login(self, email: str, password: str) -> tuple[User, str]:
        """Authenticate a user and return (user, token).

        Raises:
            ValueError: If credentials are invalid.
        """
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            raise ValueError("Invalid email or password.")

        if not user.hashed_password:
            raise ValueError("Invalid email or password.")

        if not verify_password(password, user.hashed_password, ""):
            raise ValueError("Invalid email or password.")

        token = generate_token(user.id)
        return user, token

    def get_current_user(self, user_id: int) -> User:
        """Retrieve a user by ID.

        Raises:
            ValueError: If user not found or inactive.
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found.")
        if not user.is_active:
            raise ValueError("User is inactive.")
        return user

    def logout(self, user_id: int) -> bool:
        """Logout the user.

        In this foundational implementation, logout is a no-op
        because we do not implement server-side token revocation.
        For production, implement a token blacklist or short-lived tokens
        with refresh tokens.
        """
        # Placeholder: server-side logout is not implemented in this phase.
        # In production, this should invalidate the current token
        # (e.g., add to blacklist or revoke refresh token).
        return True
