"""Database configuration.

Reads connection settings from environment variables.
Supports PostgreSQL (production) and SQLite (local development).
No secrets are hardcoded.
"""
from pydantic_settings import BaseSettings


class DatabaseSettings(BaseSettings):
    """Database settings.

    DATABASE_URL is the canonical connection string.
    For local SQLite development, use a file-based URL such as
    sqlite:///./suly_ai.db.
    For PostgreSQL production, use a URL such as
    postgresql+psycopg2://user:password@localhost:5432/suly_ai.
    """

    database_url: str = "sqlite:///./suly_ai.db"
    database_echo: bool = False

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


db_settings = DatabaseSettings()
