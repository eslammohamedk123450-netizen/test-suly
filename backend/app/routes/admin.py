"""Protected administrative API routes.

Every route requires a backend-verified admin token. Secrets are never serialized.
"""
import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from backend.app.auth.router import get_current_admin
from backend.app.db.models.admin import (
    AIModel,
    AIProvider,
    AuditLog,
    CreditTransaction,
    SubscriptionPlan,
    SystemSetting,
    UserSubscription,
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
    PlanOut,
    ProviderIn,
    ProviderOut,
    ProviderSetupIn,
    ProviderSetupOut,
    SettingUpdate,
    UserStatusUpdate,
    UserSubscriptionAssign,
    UserSubscriptionOut,
)
from backend.app.services.admin_security import encrypt_secret, fingerprint, mask_secret
from backend.app.services.provider_catalog import (
    PROVIDER_BASE_URLS,
    ProviderDiscoveryError,
    canonical_provider_type,
    discover_models,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


def audit(db: Session, admin: User, action: str, target_type: str | None = None, target_id: str | None = None, metadata: dict | None = None) -> None:
    db.add(AuditLog(admin_id=admin.id, action=action, target_type=target_type, target_id=target_id, safe_metadata_json=json.dumps(metadata or {}, sort_keys=True)))


def audit_out(row: AuditLog) -> AuditOut:
    return AuditOut(id=row.id, admin_id=row.admin_id, action=row.action, target_type=row.target_type, target_id=row.target_id, safe_metadata=json.loads(row.safe_metadata_json or "{}"), created_at=row.created_at)


def plan_out(plan: SubscriptionPlan) -> dict:
    return {
        "id": plan.id, "name": plan.name, "description": plan.description, "price": plan.price,
        "billing_period": plan.billing_period, "monthly_credits": plan.monthly_credits,
        "daily_credits": plan.daily_credits, "max_requests": plan.max_requests,
        "features": json.loads(plan.features_json or "[]"), "is_active": plan.is_active,
        "created_at": plan.created_at
    }


def provider_out(row: AIProvider) -> ProviderOut:
    return ProviderOut(id=row.id, name=row.name, provider_type=row.provider_type, base_url=row.base_url, masked_key=mask_secret(row.encrypted_api_key, row.key_fingerprint), enabled=row.enabled, priority=row.priority, timeout_seconds=row.timeout_seconds, last_test_status=row.last_test_status, last_tested_at=row.last_tested_at)


@router.get("/overview", response_model=OverviewOut)
def overview(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> OverviewOut:
    since = datetime.now(timezone.utc) - timedelta(days=30)
    recent = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(8).all()
    credits_consumed = db.query(func.coalesce(func.sum(-CreditTransaction.amount), 0)).filter(CreditTransaction.amount < 0).scalar() or 0
    total_requests = db.query(func.count(CreditTransaction.id)).filter(CreditTransaction.reason.like("AI chat request%")).scalar() or 0
    successful_requests = db.query(func.count(CreditTransaction.id)).filter(and_(CreditTransaction.reason.like("AI chat request%"), CreditTransaction.amount < 0)).scalar() or 0
    failed_requests = max(0, int(total_requests) - int(successful_requests))

    return OverviewOut(
        total_users=db.query(func.count(User.id)).scalar() or 0,
        active_users=db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0,
        new_users=db.query(func.count(User.id)).filter(User.created_at >= since).scalar() or 0,
        total_projects=db.query(func.count(Project.id)).scalar() or 0,
        active_admins=db.query(func.count(User.id)).filter(User.is_admin.is_(True), User.is_active.is_(True)).scalar() or 0,
        total_credits_consumed=int(credits_consumed),
        configured_providers=db.query(func.count(AIProvider.id)).filter(AIProvider.enabled.is_(True)).scalar() or 0,
        available_models=db.query(func.count(AIModel.id)).filter(AIModel.enabled.is_(True)).scalar() or 0,
        failed_requests=failed_requests,
        total_requests=int(total_requests),
        total_input_tokens=0,
        total_output_tokens=0,
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
    if not user: raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id and not payload.is_active: raise HTTPException(status_code=400, detail="Cannot deactivate self")
    user.is_active = payload.is_active
    audit(db, admin, "user.status_changed", "user", str(user.id), {"is_active": payload.is_active})
    db.commit()
    return user


@router.post("/users/{user_id}/credits", response_model=AdminUserOut)
def adjust_credits(user_id: int, payload: CreditAdjustment, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> AdminUserOut:
    user = db.query(User).filter(User.id == user_id).with_for_update().first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    new_balance = user.credit_balance + payload.amount
    if new_balance < 0: raise HTTPException(status_code=400, detail="Balance negative")
    user.credit_balance = new_balance
    db.add(CreditTransaction(user_id=user.id, amount=payload.amount, balance_after=new_balance, reason=payload.reason, admin_id=admin.id))
    audit(db, admin, "user.credits_adjusted", "user", str(user.id), {"amount": payload.amount, "reason": payload.reason})
    db.commit()
    db.refresh(user)
    return user


@router.get("/plans", response_model=list[PlanOut])
def list_plans(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)) -> list[PlanOut]:
    return db.query(SubscriptionPlan).order_by(SubscriptionPlan.price.asc()).all()


@router.post("/plans", response_model=PlanOut, status_code=status.HTTP_201_CREATED)
def create_plan(payload: PlanIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> PlanOut:
    if payload.billing_period != "monthly": raise HTTPException(status_code=422, detail="Only monthly supported")
    if db.query(SubscriptionPlan).filter(SubscriptionPlan.name == payload.name).first(): raise HTTPException(status_code=409, detail="Exists")
    plan = SubscriptionPlan(**payload.model_dump(exclude={"features"}), features_json=json.dumps(payload.features))
    db.add(plan)
    db.flush()
    audit(db, admin, "plan.created", "subscription_plan", plan.name)
    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(plan_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> None:
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan: raise HTTPException(status_code=404, detail="Not found")
    db.delete(plan)
    audit(db, admin, "plan.deleted", "subscription_plan", plan.name)
    db.commit()


@router.get("/providers", response_model=list[ProviderOut])
def list_providers(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)) -> list[ProviderOut]:
    return [provider_out(row) for row in db.query(AIProvider).order_by(AIProvider.priority.asc()).all()]


@router.post("/providers", response_model=ProviderOut, status_code=status.HTTP_201_CREATED)
def create_provider(payload: ProviderIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> ProviderOut:
    if db.query(AIProvider).filter(AIProvider.name == payload.name).first(): raise HTTPException(status_code=409, detail="Exists")
    provider = AIProvider(name=payload.name, provider_type=payload.provider_type, base_url=payload.base_url, enabled=payload.enabled, priority=payload.priority, timeout_seconds=payload.timeout_seconds)
    if payload.api_key:
        provider.encrypted_api_key = encrypt_secret(payload.api_key)
        provider.key_fingerprint = fingerprint(payload.api_key)
    db.add(provider)
    db.flush()
    audit(db, admin, "provider.created", "provider", provider.name)
    db.commit()
    db.refresh(provider)
    return provider_out(provider)


@router.post("/providers/setup", response_model=ProviderSetupOut, status_code=status.HTTP_201_CREATED)
def setup_provider(payload: ProviderSetupIn, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> ProviderSetupOut:
    """Create a provider and import its active text/chat models from its catalog."""
    if db.query(AIProvider).filter(AIProvider.name == payload.name).first():
        raise HTTPException(status_code=409, detail="يوجد اتصال بهذا الاسم بالفعل.")
    try:
        provider_type = canonical_provider_type(payload.provider_type)
        models = discover_models(
            provider_type,
            payload.api_key,
            timeout_seconds=payload.timeout_seconds,
        )
    except ProviderDiscoveryError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    provider = AIProvider(
        name=payload.name,
        provider_type=provider_type,
        base_url=PROVIDER_BASE_URLS[provider_type],
        encrypted_api_key=encrypt_secret(payload.api_key),
        key_fingerprint=fingerprint(payload.api_key),
        enabled=True,
        priority=payload.priority,
        timeout_seconds=payload.timeout_seconds,
    )
    try:
        db.add(provider)
        db.flush()
        for index, model_data in enumerate(models):
            db.add(AIModel(
                name=model_data["name"],
                provider_id=provider.id,
                model_identifier=model_data["model_identifier"],
                description=model_data["description"],
                context_window=model_data["context_window"],
                capabilities_json=json.dumps(model_data["capabilities"]),
                enabled=True,
                priority=index,
                fallback_eligible=True,
            ))
        audit(
            db,
            admin,
            "provider.created_with_discovered_models",
            "provider",
            provider.name,
            {"provider_type": provider_type, "models_imported": len(models)},
        )
        db.commit()
        db.refresh(provider)
    except Exception:
        db.rollback()
        raise

    return ProviderSetupOut(
        provider=provider_out(provider),
        models_imported=len(models),
        model_names=[model["name"] for model in models[:12]],
    )


@router.post("/providers/{provider_id}/test", response_model=dict)
def test_provider_connection(provider_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> dict:
    from backend.app.services.chat_service import ChatService
    provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not provider: raise HTTPException(status_code=404, detail="Not found")
    model = db.query(AIModel).filter(AIModel.provider_id == provider_id, AIModel.enabled.is_(True)).first()
    if not model: raise HTTPException(status_code=400, detail="No active model")
    try:
        ChatService(db)._complete(provider, model, "hi", [{"role": "user", "content": "hi"}])
        provider.last_test_status = "success"
        db.commit()
        return {"status": "success"}
    except Exception as e:
        provider.last_test_status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/providers/{provider_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_provider(provider_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)) -> None:
    provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not provider: raise HTTPException(status_code=404, detail="Not found")
    db.delete(provider)
    db.commit()


@router.get("/models", response_model=list[dict])
def list_models(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)) -> list[dict]:
    rows = db.query(AIModel, AIProvider.name).join(
        AIProvider, AIModel.provider_id == AIProvider.id
    ).order_by(AIProvider.priority.asc(), AIModel.priority.asc(), AIModel.id.asc()).limit(500).all()
    return [
        {
            "id": model.id,
            "name": model.name,
            "model_identifier": model.model_identifier,
            "provider_name": provider_name,
            "enabled": model.enabled,
            "priority": model.priority,
            "fallback_eligible": model.fallback_eligible,
            "auto_disabled": model.auto_disabled,
            "consecutive_failures": model.consecutive_failures,
            "last_response_latency_ms": model.last_response_latency_ms,
            "last_response_status": model.last_response_status,
            "last_response_error": model.last_response_error,
            "last_response_at": model.last_response_at.isoformat() if model.last_response_at else None,
        }
        for model, provider_name in rows
    ]


@router.patch("/models/{model_id}/priority", response_model=dict)
def update_model_priority(
    model_id: int,
    priority: int = Body(..., embed=True, ge=0, le=10000),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> dict:
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    old_priority = model.priority
    siblings = db.query(AIModel).filter(
        AIModel.provider_id == model.provider_id
    ).order_by(AIModel.priority.asc(), AIModel.id.asc()).all()
    old_index = next(index for index, item in enumerate(siblings) if item.id == model.id)
    if priority != old_priority:
        target_index = max(0, min(len(siblings) - 1,
                                  old_index + (-1 if priority < old_priority else 1)))
        moved = siblings.pop(old_index)
        siblings.insert(target_index, moved)
        for index, item in enumerate(siblings):
            item.priority = index
    audit(db, admin, "model.priority_changed", "model", str(model.id),
          {"old_priority": old_priority, "priority": model.priority})
    db.commit()
    return {"id": model.id, "priority": model.priority}


@router.patch("/models/{model_id}/enabled", response_model=dict)
def update_model_enabled(
    model_id: int,
    enabled: bool = Body(..., embed=True),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> dict:
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    model.enabled = enabled
    if enabled:
        model.auto_disabled = False
        model.consecutive_failures = 0
    else:
        model.auto_disabled = False
    audit(db, admin, "model.enabled_changed", "model", str(model.id), {"enabled": enabled})
    db.commit()
    return {"id": model.id, "enabled": model.enabled, "auto_disabled": model.auto_disabled}


@router.get("/audit", response_model=list[AuditOut])
def list_audit(skip: int = Query(0), limit: int = Query(100), db: Session = Depends(get_db), _admin: User = Depends(get_current_admin)) -> list[AuditOut]:
    return [audit_out(row) for row in db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()]
