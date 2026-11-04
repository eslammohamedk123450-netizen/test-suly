from fastapi.testclient import TestClient
from backend.app.auth.service import generate_token
from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.db.models.chat_request import ChatRequestRecord
from backend.app.main import app


def test_stream_request_id_replays_completed_response_without_second_charge(
    override_get_db, test_user, monkeypatch
):
    settings.secret_key = "unit-test-secret-that-is-not-used-in-production"
    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(
        "backend.app.routes.chat.ChatService.stream_reply_fastest",
        lambda self, message, history, attachments=None: iter(["hello", " world"]),
    )
    client = TestClient(app)
    token = generate_token(test_user.id, session_version=test_user.session_version)
    headers = {"Authorization": f"Bearer {token}", "X-Request-ID": "request-123"}
    try:
        first = client.post("/api/v1/chat/stream", headers=headers, json={"message": "hi"})
        assert first.status_code == 200
        assert '"done": true' in first.text
        db = next(override_get_db())
        record = db.query(ChatRequestRecord).filter_by(request_key="request-123").one()
        db.close()
        assert (record.status, record.reply, record.credit_balance) == ("completed", "hello world", 99)
        second = client.post("/api/v1/chat/stream", headers=headers, json={"message": "hi"})
        assert second.status_code == 200
        assert '"delta": "hello world"' in second.text
        assert '"done": true' in second.text
        assert '"credit_balance": 99' in first.text
        assert '"credit_balance": 99' in second.text
    finally:
        app.dependency_overrides.pop(get_db, None)
