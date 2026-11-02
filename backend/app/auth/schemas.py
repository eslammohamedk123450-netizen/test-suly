"""Pydantic schemas for authentication.

All schemas for authentication requests and responses.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RegisterRequest(BaseModel):
    """Request schema for user registration."""

    email: EmailStr = Field(..., description="User's email address", examples=["user@example.com"])
    password: str = Field(..., min_length=8, description="User's password (min 8 characters)")
    full_name: Optional[str] = Field(None, max_length=255, description="User's full name")


class LoginRequest(BaseModel):
    """Request schema for user login."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class TokenResponse(BaseModel):
    """Response schema for authentication tokens."""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")


class CurrentUserResponse(BaseModel):
    """Response schema for current authenticated user."""

    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: str


class TokenData(BaseModel):
    """Schema for token data payload."""

    subject: Optional[str] = None  # User ID as string
    token_type: Optional[str] = "access"


