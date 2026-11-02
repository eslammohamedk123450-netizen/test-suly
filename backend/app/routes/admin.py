"""Protected administrative API routes.

Every route requires a backend-verified admin token. Secrets are never serialized.
"""
import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend.app.auth.router import get_current_admin
from backend.app.db.models.admin import (
    AIModel,
    AIProvider,
    AuditLog,
    CreditTransaction,
    SubscriptionPlan,
    SystemSetting,
)
from backend.app.db.models.project import Project
from backend.app.db.models.user import User
from backend.app.db.session import get_db
from backend.app.schemas.admin import (
    AdminUserOut,
    AuditOut,
    CreditAdjustment,
    ModelIn,
    OverviewOut,
    PlanIn,
    ProviderIn,
    ProviderOut,
    SettingUpdate,
    UserStatusUpdate,
)
from backend.app.services.admin_security import encrypt_secret, fingerprint, mask_secret

router = APIRouter(prefix="/admin", tags=["Admin"])


def audit(db: Session, admin: User, action: str, target_type: str | None = None, target_id: str | None = None, metadata: dict | None = None) -> None:
    db.add(AuditLog(admin_id=admin.id, action=action, target_type=target_type, target_id=target_id, safe_metadata_json=json.dumps(metadata or {}, sort_keys=True)))


def audit_out(row: AuditLog) -> AuditOut:
    return AuditOut(id=row.id, admin_id=row.admin_id, action=row.action, target_type=row.target_type, target_id=row.target_id, safe_metadata=json.loads(row.safe_metadata_json or "{}"), created_at=row.created_at)


def provider_out(row: AIProvider) -> ProviderOut:
    return ProviderOut(id=row.id, name=row.name, provider_type=row.provider_type, base_url=row.base_url, masked_key=mask_secret(row.encrypted_api_key, row.key_fingerprint), enabled=row.enabled, priority=row.priority, timeout_seconds=row.timeout_seconds, last_test_status=row.last_test_status, last_tested_at=row.last_tested_at)


@router.get("/overview", response_model=OverviewOut)
def overview(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> OverviewOut:
    since = datetime.now(timezone.utc) - timedelta(days=30)
    recent = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(8).all()
    credits_consumed = db.query(func.coalesce(func.sum(-CreditTransaction.amount), 0)).filter(CreditTransaction.amount < 0).scalar() or 0
    return OverviewOut(
        total_users=db.query(func.count(User.id)).scalar() or 0,
        active_users=db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0,
        new_users=db.query(func.count(User.id)).filter(User.created_at >= since).scalar() or 0,
        total_projects=db.query(func.count(Project.id)).scalar() or 0,
        active_admins=db.query(func.count(User.id)).filter(User.is_admin.is_(True), User.is_active.is_(True)).scalar() or 0,
        total_credits_consumed=int(credits_consumed),
        configured_providers=db.query(func.count(AIProvider.id)).filter(AIProvider.enabled.is_(True)).scalar() or 0,
        available_models=db.query(func.count(AIModel.id)).filter(AIModel.enabled.is_(True)).scalar() or 0,
        failed_requests=0,
        recent_activity=[audit_out(row) for row in recent],
    )


@router.get("/users", response_model=list[AdminUserOut])
def users(search: str | None = Query(default=None, max_length=120), active: bool | None = None, skip: int = 0, limit: int = Query(50, ge=1, le=100), db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)) -> list[AdminUserOut]:
    query = db.query(User)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(User.email.ilike(like), User.full_name.ilike(like)))
    if active is not None:
        query = query.filter(User.is_active.is_(active))
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/users/{user_id}/status", response_model=AdminUserOut)
def update_user_status(user_id: int, payload: UserStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminUserOut:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id and not payload.is_active:
        raise HTTPException(status_code=400, detail="An administrator cannot deactivate their own account")
    user.is_active = payload.is_active
    audit(db, admin, "user.status_changed", "user", str(user.id), {"is_active": payload.is_active})
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/credits", response_model=AdminUserOut)
def adjust_credits(user_id: int, payload: CreditAdjustment, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminUserOut:
    user = db.query(User).filter(User.id == user_id).with_for_update().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_balance = user.credit_balance + payload.amount
    if new_balance < 0:
        raise HTTPException(status_code=400, detail="Credit balance cannot become negative")
    user.credit_balance = new_balance
    db.add(CreditTransaction(user_id=user.id, amount=payload.amount, balance_after=new_balance, reason=payload.reason, admin_id=admin.id))
    audit(db, admin, "user.credits_adjusted", "user", str(user.id), {"amount": payload.amount, "reason": payload.reason})
    db.commit()
    db.refresh(user)
    return user


@router.get("/plans", response_model=list[dict])
def list_plans(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)) -> list[dict]:
    rows = db.query(SubscriptionPlan).order_by(SubscriptionPlan.price.asc()).all()
    return [{"id": p.id, "name": p.name, "description": p.description, "price": p.price, "billing_period": p.billing_period, "monthly_credits": p.monthly_credits, "daily_credits": p.daily_credits, "max_requests": p.max_requests, "features": json.loads(p.features_json or "[]"), "is_active": p.is_active} for p in rows]


@router.post("/plans", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_plan(payload: PlanIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> dict:
    if db.query(SubscriptionPlan).filter(SubscriptionPlan.name == payload.name).first():
        raise HTTPException(status_code=409, detail="Plan name already exists")
    plan = SubscriptionPlan(**payload.model_dump(exclude={"features"}), features_json=json.dumps(payload.features))
    db.add(plan)
    audit(db, admin, "plan.created", "subscription_plan", payload.name)
    db.commit()
    db.refresh(plan)
    return {"id": plan.id, "name": plan.name, "is_active": plan.is_active}


@router.get("/providers", response_model=list[ProviderOut])
def list_providers(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)) -> list[ProviderOut]:
    return [provider_out(row) for row in db.query(AIProvider).order_by(AIProvider.priority.asc()).all()]


@router.post("/providers", response_model=ProviderOut, status_code=status.HTTP_201_CREATED)
def create_provider(payload: ProviderIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> ProviderOut:
    if db.query(AIProvider).filter(AIProvider.name == payload.name).first():
        raise HTTPException(status_code=409, detail="Provider name already exists")
    provider = AIProvider(name=payload.name, provider_type=payload.provider_type, base_url=payload.base_url, enabled=payload.enabled, priority=payload.priority, timeout_seconds=payload.timeout_seconds)
    if payload.api_key:
        try:
            provider.encrypted_api_key = encrypt_secret(payload.api_key)
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        provider.key_fingerprint = fingerprint(payload.api_key)
    db.add(provider)
    audit(db, admin, "provider.created", "provider", payload.name, {"has_key": bool(payload.api_key)})
    db.commit()
    db.refresh(provider)
    return provider_out(provider)


@router.get("/models", response_model=list[dict])
def list_models(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)) -> list[dict]:
    rows = db.query(AIModel).order_by(AIModel.priority.asc()).all()
    return [{"id": m.id, "name": m.name, "provider_id": m.provider_id, "model_identifier": m.model_identifier, "description": m.description, "input_price": m.input_price, "output_price": m.output_price, "context_window": m.context_window, "capabilities": json.loads(m.capabilities_json or "[]"), "enabled": m.enabled, "priority": m.priority, "fallback_eligible": m.fallback_eligible} for m in rows]


@router.post("/models", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_model(payload: ModelIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> dict:
    if not db.query(AIProvider).filter(AIProvider.id == payload.provider_id).first():
        raise HTTPException(status_code=404, detail="Provider not found")
    model = AIModel(**payload.model_dump(exclude={"capabilities"}), capabilities_json=json.dumps(payload.capabilities))
    db.add(model)
    audit(db, admin, "model.created", "model", payload.model_identifier)
    db.commit()
    db.refresh(model)
    return {"id": model.id, "name": model.name, "enabled": model.enabled}


@router.get("/settings", response_model=dict)
def list_settings(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)) -> dict:
    return {row.key: ("[hidden]" if row.is_sensitive else row.value) for row in db.query(SystemSetting).order_by(SystemSetting.key.asc()).all()}


@router.put("/settings/{key}", response_model=dict)
def update_setting(key: str, payload: SettingUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> dict:
    if key.lower().endswith(("secret", "key", "password", "token")):
        raise HTTPException(status_code=400, detail="Sensitive environment settings cannot be changed from the dashboard")
    row = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not row:
        row = SystemSetting(key=key, value=payload.value, is_sensitive=False)
        db.add(row)
    else:
        row.value = payload.value
    audit(db, admin, "setting.updated", "system_setting", key)
    db.commit()
    return {"key": key, "value": payload.value}


@router.get("/audit", response_model=list[AuditOut])
def audit_logs(skip: int = 0, limit: int = Query(50, ge=1, le=100), db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)) -> list[AuditOut]:
    rows = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return [audit_out(row) for row in rows]
