from fastapi.testclient import TestClient
from backend.app.auth.service import generate_token
from backend.app.core.config import settings
from backend.app.db.models.usage import UsageRecord
from backend.app.db.session import get_db
from backend.app.main import app


def test_usage_route_returns_only_current_users_records(override_get_db, db_session, test_user, test_admin_user):
    settings.secret_key = "unit-test-secret-that-is-not-used-in-production"
    db_session.add_all([
        UsageRecord(user_id=test_user.id, request_id="mine", operation="chat_stream", status="completed", credits_consumed=1),
        UsageRecord(user_id=test_admin_user.id, request_id="other", operation="chat_stream", status="completed", credits_consumed=1),
    ])
    db_session.commit()
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    try:
        token = generate_token(test_user.id, session_version=test_user.session_version)
        response = client.get("/api/v1/usage", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert [item["request_id"] for item in response.json()] == ["mine"]
    finally:
        app.dependency_overrides.pop(get_db, None)
