from pathlib import Path
from fastapi.testclient import TestClient
from backend.app.auth.service import generate_token
from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.main import app


def test_upload_metadata_and_ownership_are_enforced(override_get_db, test_user, test_admin_user, tmp_path: Path):
    settings.secret_key = "unit-test-secret-that-is-not-used-in-production"
    settings.upload_dir = str(tmp_path)
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    try:
        user_token = generate_token(test_user.id, session_version=test_user.session_version)
        other_token = generate_token(test_admin_user.id, session_version=test_admin_user.session_version)
        response = client.post(
            "/api/v1/files/upload",
            headers={"Authorization": f"Bearer {user_token}"},
            files={"upload": ("notes.txt", b"private notes", "text/plain")},
        )
        assert response.status_code == 201
        payload = response.json()
        assert payload["original_name"] == "notes.txt"
        assert payload["size_bytes"] == 13
        file_id = payload["id"]
        assert client.get(f"/api/v1/files/{file_id}", headers={"Authorization": f"Bearer {other_token}"}).status_code == 404
        assert client.get(f"/api/v1/files/{file_id}", headers={"Authorization": f"Bearer {user_token}"}).status_code == 200
        assert client.delete(f"/api/v1/files/{file_id}", headers={"Authorization": f"Bearer {user_token}"}).status_code == 200
        assert not list(tmp_path.rglob("*.upload"))
    finally:
        app.dependency_overrides.pop(get_db, None)
