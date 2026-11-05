import pytest
from fastapi.testclient import TestClient

from backend.app.auth.service import generate_token
from backend.app.core.config import settings
from backend.app.db.models.admin import Conversation, Message
from backend.app.db.session import get_db
from backend.app.main import app


@pytest.mark.parametrize(
    ("temporary", "expected_conversations", "expected_messages"),
    [(True, 0, 0), (False, 1, 2)],
)
def test_temporary_chat_is_not_persisted_but_regular_chat_is(
    temporary,
    expected_conversations,
    expected_messages,
    override_get_db,
    test_user,
    monkeypatch,
):
    settings.secret_key = "unit-test-secret-that-is-not-used-in-production"
    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(
        "backend.app.routes.chat.ChatService.get_reply_fastest",
        lambda self, prompt, history, attachments=None: "A test reply",
    )
    client = TestClient(app)
    token = generate_token(test_user.id, session_version=test_user.session_version)
    try:
        response = client.post(
            "/api/v1/chat/",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "message": "Do not keep this message" if temporary else "Keep this message",
                "history": [],
                "temporary": temporary,
            },
        )
        assert response.status_code == 200, response.text
        assert response.json()["reply"] == "A test reply"

        db = next(override_get_db())
        try:
            assert db.query(Conversation).count() == expected_conversations
            assert db.query(Message).count() == expected_messages
        finally:
            db.close()
    finally:
        app.dependency_overrides.pop(get_db, None)
