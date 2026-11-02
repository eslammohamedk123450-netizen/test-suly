"""Database session management.

Provides [engine], [SessionLocal], and [get_db] dependency.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.db.config import db_settings

engine = create_engine(db_settings.database_url, echo=db_settings.database_echo)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)


def get_db() -> Session:
    """Yield a database session and ensure it is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
