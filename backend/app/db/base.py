"""SQLAlchemy declarative base.

All database models inherit from [Base].
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass
