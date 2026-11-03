"""Pydantic schemas for authentication and user credit endpoints."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


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
    """Short-lived authentication token and initial account balance."""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    credit_balance: int = Field(default=0, ge=0)


class CurrentUserResponse(BaseModel):
    """Response schema for the current authenticated user."""

    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    is_admin: bool = False
    credit_balance: int = Field(default=0, ge=0)
    created_at: str


class CreditBalanceOut(BaseModel):
    """Current spendable SULY credit balance."""

    balance: int = Field(..., ge=0)
    currency: str = "SULY Credits"


class CreditTransactionOut(BaseModel):
    """One immutable entry in the user's credit ledger."""

    id: int
    amount: int
    balance_after: int
    reason: str
    created_at: datetime


class DailyBonusInfo(BaseModel):
    """Result of checking or awarding the daily credit bonus."""

    amount: int = 200
    reason: str = "daily_bonus"
    balance: int = Field(..., ge=0)
    next_eligible_at: datetime
    awarded_today: bool = False
    already_granted_today: bool = False


class TokenData(BaseModel):
    """Schema for token data payload."""

    subject: Optional[str] = None
    token_type: Optional[str] = "access"
