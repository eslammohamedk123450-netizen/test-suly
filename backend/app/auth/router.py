"""Authentication and secure first-admin bootstrap routes."""
from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.app.auth.schemas import CurrentUserResponse, LoginRequest, RegisterRequest, TokenResponse
from backend.app.auth.service import AuthService, decode_token, generate_token, token_identifier, verify_token
from backend.app.core.config import settings
from backend.app.db.models.user import User
from backend.app.db.models.admin import RevokedToken
from backend.app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def _response(user: User) -> CurrentUserResponse:
    return CurrentUserResponse(id=user.id, email=user.email, full_name=user.full_name, is_active=user.is_active, is_admin=user.is_admin, created_at=str(user.created_at))


def get_current_user_record(db: Session = Depends(get_db), token: str | None = Depends(oauth2_scheme)) -> User:
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
        return AuthService(db).get_current_user(user_id)
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
        return _response(AuthService(db).register(request.email, request.password, request.full_name))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        _, token = AuthService(db).login(request.email, request.password)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc), headers={"WWW-Authenticate": "Bearer"}) from exc
    return TokenResponse(access_token=token, token_type="bearer")


@router.post("/admin/login", response_model=TokenResponse)
def admin_login(request: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        _, token = AuthService(db).login(request.email, request.password, admin_only=True)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc), headers={"WWW-Authenticate": "Bearer"}) from exc
    return TokenResponse(access_token=token, token_type="bearer")


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
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=409, detail="A user with this email already exists")
    # Register first, then promote the new account in the same database.
    user = AuthService(db).register(request.email, request.password, request.full_name)
    user.is_admin = True
    db.commit()
    db.refresh(user)
    return _response(user)


@router.get("/me", response_model=CurrentUserResponse)
def me(current_user: CurrentUserResponse = Depends(get_current_user)) -> CurrentUserResponse:
    return current_user


@router.post("/logout")
def logout(
    current: User = Depends(get_current_user_record),
    db: Session = Depends(get_db),
    token: str | None = Depends(oauth2_scheme),
) -> dict:
    if not token or not AuthService(db).logout(current.id, token):
        raise HTTPException(status_code=401, detail="The current token could not be revoked")
    return {"message": "Logged out successfully; token has been revoked"}
