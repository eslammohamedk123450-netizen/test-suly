"""Authentication and secure first-admin bootstrap routes."""

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.auth.schemas import (
    CreditBalanceOut,
    CreditTransactionOut,
    CurrentUserResponse,
    DailyBonusInfo,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from backend.app.auth.service import (
    DAILY_CREDIT_AMOUNT,
    AuthService,
    decode_token,
    generate_token,
    next_cairo_midnight,
    token_identifier,
    verify_token,
)
from backend.app.core.config import settings
from backend.app.db.models.admin import CreditTransaction, RevokedToken
from backend.app.db.models.user import User
from backend.app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def _response(user: User) -> CurrentUserResponse:
    return CurrentUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        is_admin=user.is_admin,
        credit_balance=user.credit_balance,
        created_at=user.created_at.isoformat() if user.created_at else "",
    )


def get_current_user_record(
    db: Session = Depends(get_db), token: str | None = Depends(oauth2_scheme)
) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated", headers={"WWW-Authenticate": "Bearer"})
    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token", headers={"WWW-Authenticate": "Bearer"})
    payload = decode_token(token)
    token_id = token_identifier(token, payload) if payload else None
    if token_id and db.query(RevokedToken).filter(RevokedToken.token_id == token_id).first():
        raise HTTPException(status_code=401, detail="Token has been revoked", headers={"WWW-Authenticate": "Bearer"})
    try:
        service = AuthService(db)
        user = service.get_current_user(user_id)
        # The database scheduler grants at Cairo midnight; this idempotent check
        # is a fallback for delayed jobs and makes the balance current on app use.
        service.award_daily_bonus(user)
        return user
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc), headers={"WWW-Authenticate": "Bearer"}) from exc


def get_current_user(current: User = Depends(get_current_user_record)) -> CurrentUserResponse:
    return _response(current)


def get_current_admin(current: User = Depends(get_current_user_record)) -> User:
    if not current.is_admin:
        raise HTTPException(status_code=403, detail="Administrator access required")
    return current


@router.post("/register", response_model=CurrentUserResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)) -> CurrentUserResponse:
    try:
        user = AuthService(db).register(request.email, request.password, request.full_name)
        return _response(user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        user, token = AuthService(db).login(request.email, request.password)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc), headers={"WWW-Authenticate": "Bearer"}) from exc
    return TokenResponse(access_token=token, token_type="bearer", credit_balance=user.credit_balance)


@router.post("/admin/login", response_model=TokenResponse)
def admin_login(request: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        user, token = AuthService(db).login(request.email, request.password, admin_only=True)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc), headers={"WWW-Authenticate": "Bearer"}) from exc
    return TokenResponse(access_token=token, token_type="bearer", credit_balance=user.credit_balance)


@router.post("/admin/bootstrap", response_model=CurrentUserResponse)
def bootstrap_admin(
    request: RegisterRequest,
    db: Session = Depends(get_db),
    x_admin_bootstrap_token: str | None = Header(default=None),
) -> CurrentUserResponse:
    """Create the first admin only when explicitly enabled through environment secrets."""
    if not settings.admin_bootstrap_token or x_admin_bootstrap_token != settings.admin_bootstrap_token:
        raise HTTPException(status_code=403, detail="Admin bootstrap is not enabled")
    if settings.admin_bootstrap_email and request.email.lower() != settings.admin_bootstrap_email.lower():
        raise HTTPException(status_code=403, detail="Bootstrap email is not allowed")
    if db.query(User).filter(User.is_admin.is_(True)).first():
        raise HTTPException(status_code=409, detail="An administrator already exists")
    if db.query(User).filter(User.email == request.email.lower()).first():
        raise HTTPException(status_code=409, detail="A user with this email already exists")
    # Admin bootstrap does not consume the regular-user registration bonus.
    try:
        user = AuthService(db).register(
            request.email,
            request.password,
            request.full_name,
            grant_welcome_credits=False,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    user.is_admin = True
    db.commit()
    db.refresh(user)
    return _response(user)


@router.get("/me", response_model=CurrentUserResponse)
def me(current_user: User = Depends(get_current_user_record)) -> CurrentUserResponse:
    return _response(current_user)


@router.post("/logout")
def logout(
    current: User = Depends(get_current_user_record),
    db: Session = Depends(get_db),
    token: str | None = Depends(oauth2_scheme),
) -> dict:
    if not token or not AuthService(db).logout(current.id, token):
        raise HTTPException(status_code=401, detail="The current token could not be revoked")
    return {"message": "Logged out successfully; token has been revoked"}


@router.get("/credits/balance", response_model=CreditBalanceOut)
def get_credit_balance(current_user: User = Depends(get_current_user_record)) -> CreditBalanceOut:
    return CreditBalanceOut(balance=current_user.credit_balance)


@router.get("/credits/history", response_model=list[CreditTransactionOut])
def get_credit_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> list[CreditTransactionOut]:
    stmt = (
        select(CreditTransaction)
        .where(CreditTransaction.user_id == current_user.id)
        .order_by(CreditTransaction.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    transactions = db.execute(stmt).scalars().all()
    return [
        CreditTransactionOut(
            id=tx.id,
            amount=tx.amount,
            balance_after=tx.balance_after,
            reason=tx.reason,
            created_at=tx.created_at,
        )
        for tx in transactions
    ]


@router.post("/credits/daily-bonus", response_model=DailyBonusInfo)
def award_daily_bonus_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
) -> DailyBonusInfo:
    service = AuthService(db)
    # get_current_user_record may already have awarded the bonus; this second
    # call is safe and keeps the endpoint idempotent for clients and retries.
    awarded = service.award_daily_bonus(current_user)
    already_granted = service.has_daily_bonus_today(current_user) and not awarded
    return DailyBonusInfo(
        amount=DAILY_CREDIT_AMOUNT,
        reason="daily_bonus",
        balance=current_user.credit_balance,
        next_eligible_at=next_cairo_midnight(),
        awarded_today=awarded,
        already_granted_today=already_granted,
    )
