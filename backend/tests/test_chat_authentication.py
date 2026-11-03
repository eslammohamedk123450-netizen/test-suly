from fastapi.testclient import TestClient

from backend.app.main import app


def test_chat_rejects_anonymous_request():
    client = TestClient(app)
    response = client.post(
        "/api/v1/chat/",
        json={"message": "hello", "history": []},
    )
    assert response.status_code == 401
