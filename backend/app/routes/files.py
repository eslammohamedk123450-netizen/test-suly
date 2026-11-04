"""Bounded local file storage with backend ownership checks.

Production deployments should replace the local adapter with private object storage
and a malware-scanning pipeline before making files available to providers.
"""
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from backend.app.auth.router import get_current_user_record
from backend.app.core.config import settings
from backend.app.db.models.file import UserFile
from backend.app.db.models.user import User
from backend.app.db.session import get_db

router = APIRouter(prefix="/files", tags=["Files"])


class FileOut(BaseModel):
    id: int
    original_name: str
    content_type: str
    size_bytes: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


def _owned_file(db: Session, file_id: int, user_id: int) -> UserFile:
    item = db.query(UserFile).filter(
        UserFile.id == file_id, UserFile.user_id == user_id, UserFile.deleted_at.is_(None)
    ).first()
    if item is None:
        raise HTTPException(status_code=404, detail="File not found or access denied")
    return item


@router.post("/upload", response_model=FileOut, status_code=status.HTTP_201_CREATED)
def upload_file(
    upload: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
) -> FileOut:
    content_type = (upload.content_type or "").lower()
    if content_type not in settings.allowed_upload_content_types:
        raise HTTPException(status_code=415, detail="File type is not allowed")
    original_name = Path(upload.filename or "file").name[:255]
    storage_name = f"{uuid4().hex}.upload"
    target_dir = Path(settings.upload_dir).resolve() / str(current_user.id)
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / storage_name
    size = 0
    try:
        with target.open("xb") as output:
            while chunk := upload.file.read(1024 * 1024):
                size += len(chunk)
                if size > settings.max_upload_size_bytes:
                    raise HTTPException(status_code=413, detail="File exceeds the configured size limit")
                output.write(chunk)
    except HTTPException:
        target.unlink(missing_ok=True)
        raise
    except Exception:
        target.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Could not store file")
    item = UserFile(
        user_id=current_user.id,
        storage_name=storage_name,
        original_name=original_name,
        content_type=content_type,
        size_bytes=size,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{file_id}", response_model=FileOut)
def get_file_metadata(file_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_record)) -> FileOut:
    return _owned_file(db, file_id, current_user.id)


@router.delete("/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_record)) -> dict:
    item = _owned_file(db, file_id, current_user.id)
    target = Path(settings.upload_dir).resolve() / str(current_user.id) / item.storage_name
    target.unlink(missing_ok=True)
    item.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "File deleted"}
