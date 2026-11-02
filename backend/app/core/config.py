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

    api_v1_prefix: str = "/api/v1"

    # Authentication settings
    auth_token_expire_seconds: int = 3600
    password_hash_algorithm: str = "sha256"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
