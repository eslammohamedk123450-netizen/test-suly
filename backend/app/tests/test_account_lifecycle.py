from fastapi import HTTPException
from backend.app.auth.router import get_current_user_record
from backend.app.auth.service import AuthService, generate_token, hash_password
from backend.app.core.config import settings
from backend.app.db.models.user import User


def test_session_version_revokes_existing_tokens(db_session):
    settings.secret_key = "unit-test-secret-that-is-not-used-in-production"
    user = User(
        email="session@example.com",
        hashed_password=hash_password("old-password")[0],
        is_active=True,
        is_admin=False,
        credit_balance=0,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = generate_token(user.id, session_version=user.session_version)
    AuthService(db_session).revoke_all_sessions(user)
    try:
        get_current_user_record(db_session, token)
        assert False, "revoked session was accepted"
    except HTTPException as error:
        assert error.status_code == 401
        assert error.detail == "Session has been revoked"


def test_change_password_revokes_old_token_and_accepts_new_password(db_session):
    settings.secret_key = "unit-test-secret-that-is-not-used-in-production"
    service = AuthService(db_session)
    user = service.register("password@example.com", "old-password", None)
    token = generate_token(user.id, session_version=user.session_version)
    service.change_password(user, "old-password", "new-password")
    assert service.login("password@example.com", "new-password")[0].id == user.id
    try:
        get_current_user_record(db_session, token)
        assert False, "old token remained valid after password change"
    except HTTPException as error:
        assert error.status_code == 401


def test_delete_account_deactivates_user_and_invalidates_access(db_session):
    settings.secret_key = "unit-test-secret-that-is-not-used-in-production"
    service = AuthService(db_session)
    user = service.register("delete@example.com", "old-password", None)
    token = generate_token(user.id, session_version=user.session_version)
    service.delete_account(user, "old-password")
    assert user.is_active is False
    try:
        get_current_user_record(db_session, token)
        assert False, "deleted account remained accessible"
    except HTTPException as error:
        assert error.status_code == 401
