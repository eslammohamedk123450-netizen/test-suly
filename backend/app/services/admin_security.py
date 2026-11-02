"""Server-side encryption helpers for provider credentials."""
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from backend.app.core.config import settings


def _fernet() -> Fernet:
    if not settings.credential_encryption_key:
        raise RuntimeError("CREDENTIAL_ENCRYPTION_KEY is not configured")
    try:
        return Fernet(settings.credential_encryption_key.encode("utf-8"))
    except (ValueError, TypeError) as exc:
        raise RuntimeError("CREDENTIAL_ENCRYPTION_KEY is invalid") from exc


def encrypt_secret(value: str) -> str:
    return _fernet().encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_secret(value: str) -> str:
    try:
        return _fernet().decrypt(value.encode("utf-8")).decode("utf-8")
    except InvalidToken as exc:
        raise RuntimeError("Stored provider credential cannot be decrypted") from exc


def fingerprint(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def mask_secret(value: str | None, fingerprint_value: str | None) -> str | None:
    if not value and not fingerprint_value:
        return None
    return f"•••••••• ({fingerprint_value or 'stored'})"
