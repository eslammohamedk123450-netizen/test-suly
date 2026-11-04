from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException
from backend.app.auth.service import generate_token
from backend.app.core.config import settings
from backend.app.db.models.file import UserFile
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


def test_chat_attachment_extraction_checks_ownership_and_handles_text_and_image(db_session, test_user, tmp_path: Path):
    from backend.app.routes.chat import _load_chat_attachments

    settings.upload_dir = str(tmp_path)
    user_dir = tmp_path / str(test_user.id)
    user_dir.mkdir(parents=True)
    (user_dir / "notes.upload").write_text("Confidential note", encoding="utf-8")
    (user_dir / "photo.upload").write_bytes(b"image-bytes")
    note = UserFile(user_id=test_user.id, storage_name="notes.upload", original_name="notes.txt", content_type="text/plain", size_bytes=17)
    image = UserFile(user_id=test_user.id, storage_name="photo.upload", original_name="photo.png", content_type="image/png", size_bytes=11)
    db_session.add_all([note, image])
    db_session.commit()
    db_session.refresh(note)
    db_session.refresh(image)

    attachments = _load_chat_attachments(db_session, [note.id, image.id], test_user.id)

    assert attachments[0]["text"] == "Confidential note"
    assert attachments[1]["image_data_url"].startswith("data:image/png;base64,")
    with pytest.raises(HTTPException) as exc:
        _load_chat_attachments(db_session, [note.id], test_user.id + 999)
    assert exc.value.status_code == 404
