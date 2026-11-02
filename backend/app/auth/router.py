"""Authentication routes.

Exposes the following endpoints under /api/v1/auth:
- POST /register - Register a new user
- POST /login    - Authenticate and get access token
- GET  /me       - Get current authenticated user
- POST /logout   - Logout (placeholder — no server-side revocation)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.app.auth.schemas import (
    CurrentUserResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from backend.app.auth.service import AuthService, verify_token
from backend.app.core.config import settings
from backend.app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

# OAuth2 password bearer scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
    description="OAuth2 password bearer scheme for authentication",
)


# ---------------------------------------------------------------------------
# Dependency: get current authenticated user
# ---------------------------------------------------------------------------


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> CurrentUserResponse:
    """Get the currently authenticated user.

    Extracts user ID from the Bearer token and fetches the user from the database.
    Returns 401 if the token is missing, invalid, or user is inactive.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth_service = AuthService(db)
    try:
        user = auth_service.get_current_user(user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    return CurrentUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=str(user.created_at),
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post(
    "/register",
    response_model=CurrentUserResponse,
    summary="Register a new user",
    tags=["Authentication"],
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
) -> CurrentUserResponse:
    """Register a new user with email, password, and optional full name.

    Returns the created user (excluding the password hash).
    """
    auth_service = AuthService(db)
    try:
        user = auth_service.register(
            email=request.email,
            password=request.password,
            full_name=request.full_name,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    return CurrentUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=str(user.created_at),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and get access token",
    tags=["Authentication"],
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticate user credentials and return an access token.

    Returns 401 if credentials are invalid.
    """
    auth_service = AuthService(db)
    try:
        user, token = auth_service.login(
            email=request.email,
            password=request.password,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    return TokenResponse(access_token=token, token_type="bearer")


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    summary="Get current authenticated user",
    tags=["Authentication"],
)
def me(
    current_user: CurrentUserResponse = Depends(get_current_user),
) -> CurrentUserResponse:
    """Get the currently authenticated user's profile.

    Returns 401 if not authenticated.
    """
    return current_user


@router.post(
    "/logout",
    summary="Logout (placeholder)",
    tags=["Authentication"],
)
def logout(
    token: str = Depends(oauth2_scheme),  # type: ignore
) -> dict:
    """Logout the current user.

    Note: This endpoint is a placeholder in the foundational implementation.
    Server-side token revocation is not implemented in this phase.
    In production, this should invalidate the current token (e.g.,
    add to blacklist, revoke refresh token, or use short-lived tokens).

    Returns 200 with a success message if token was provided.
    Returns 401 if no valid token was provided.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth_service = AuthService()  # Note: not used in this placeholder
    auth_service.logout(user_id)

    return {"message": "Logged out successfully"}
