"""Small non-destructive schema bootstrap for the current SQLite foundation.

This is intentionally not a replacement for a migration system. It creates new
admin tables and adds only missing nullable-safe columns to the existing users
 table so existing records are preserved.
"""
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from backend.app.db.base import Base
from backend.app.db.models import admin as _admin_models  # noqa: F401
from backend.app.db.models import project as _project_model  # noqa: F401
from backend.app.db.models import user as _user_model  # noqa: F401


def ensure_schema(engine: Engine) -> None:
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    if engine.url.get_backend_name() != "sqlite" or "users" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("users")}
    additions = {
        "is_admin": "BOOLEAN NOT NULL DEFAULT 0",
        "credit_balance": "INTEGER NOT NULL DEFAULT 0",
    }
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {name} {definition}"))
