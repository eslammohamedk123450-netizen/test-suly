"""Application configuration.

Reads settings from environment variables with safe defaults.
No secrets are hardcoded here.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """SULY AI backend settings.

    Every value can be overridden via environment variables or a .env file.
    See .env.example for the expected variable names.
    """

    app_name: str = "SULY AI API"
    app_version: str = "v1"
    environment: str = "development"
    debug: bool = False

    # ASGI server
    host: str = "0.0.0.0"
    port: int = 8000

    # Secrets must be provided via environment, never hardcoded.
    secret_key: str | None = None
    credential_encryption_key: str | None = None
    admin_bootstrap_token: str | None = None
    admin_bootstrap_email: str | None = None

    # JSON array from CORS_ALLOWED_ORIGINS; configure production origins explicitly.
    cors_allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:8080",
    ]

    api_v1_prefix: str = "/api/v1"

    # Authentication settings
    auth_token_expire_seconds: int = 3600
    admin_token_expire_seconds: int = 1800
    password_hash_algorithm: str = "sha256"
    upload_dir: str = "./.suly_uploads"
    max_upload_size_bytes: int = 10 * 1024 * 1024
    # API-first racing timings. Browser workers remain opt-in and site-specific.
    free_provider_grace_period: float = 3.0
    browser_prepare_at: float = 2.0
    web_provider_timeout: float = 60.0
    first_valid_chunk_required: bool = True
    browser_worker_count: int = 3
    browser_queue_size: int = 30
    allowed_upload_content_types: list[str] = [
        "application/pdf", "text/plain", "text/markdown", "text/csv",
        "application/json", "image/png", "image/jpeg", "image/webp",
    ]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
