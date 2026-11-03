import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.auth.router import get_current_user_record
from backend.app.auth.service import AuthService, generate_token, verify_token
from backend.app.core.config import settings
from backend.app.db.base import Base
from backend.app.db.models.admin import RevokedToken  # noqa: F401 - registers model


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


def test_logout_revokes_token_for_following_requests(db_session):
    settings.secret_key = "unit-test-secret-that-is-not-used-in-production"
    token = generate_token(123)
    assert verify_token(token) == 123

    assert AuthService(db_session).logout(123, token) is True
    assert db_session.query(RevokedToken).count() == 1

    with pytest.raises(HTTPException) as error:
        get_current_user_record(db_session, token)
    assert error.value.status_code == 401
