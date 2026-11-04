"""User-scoped usage history; values are recorded only from backend events."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.auth.router import get_current_user_record
from backend.app.db.models.usage import UsageRecord
from backend.app.db.models.user import User
from backend.app.db.session import get_db
from backend.app.schemas.chat import UsageSummaryOut

router = APIRouter(prefix="/usage", tags=["Usage"])


@router.get("", response_model=list[UsageSummaryOut])
def list_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
) -> list[UsageSummaryOut]:
    rows = (
        db.query(UsageRecord)
        .filter(UsageRecord.user_id == current_user.id)
        .order_by(UsageRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [UsageSummaryOut.model_validate(row) for row in rows]
