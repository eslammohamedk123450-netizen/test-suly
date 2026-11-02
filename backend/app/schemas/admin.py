"""Validated request/response schemas for the admin API."""
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    credit_balance: int
    created_at: datetime


class UserStatusUpdate(BaseModel):
    is_active: bool


class CreditAdjustment(BaseModel):
    amount: int = Field(..., ge=-1_000_000, le=1_000_000)
    reason: str = Field(..., min_length=3, max_length=255)


class PlanIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    description: Optional[str] = Field(None, max_length=500)
    price: float = Field(0.0, ge=0)
    billing_period: str = Field("monthly", max_length=30)
    monthly_credits: int = Field(0, ge=0)
    daily_credits: int = Field(0, ge=0)
    max_requests: int = Field(0, ge=0)
    features: list[str] = Field(default_factory=list)
    is_active: bool = True


class ProviderIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    provider_type: str = Field(..., min_length=1, max_length=50)
    base_url: Optional[str] = Field(None, max_length=500)
    api_key: Optional[str] = Field(None, min_length=1, max_length=4096)
    enabled: bool = False
    priority: int = Field(100, ge=0, le=10000)
    timeout_seconds: int = Field(30, ge=1, le=300)


class ProviderOut(BaseModel):
    id: int
    name: str
    provider_type: str
    base_url: Optional[str]
    masked_key: Optional[str]
    enabled: bool
    priority: int
    timeout_seconds: int
    last_test_status: Optional[str]
    last_tested_at: Optional[datetime]


class ModelIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    provider_id: int
    model_identifier: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    input_price: float = Field(0, ge=0)
    output_price: float = Field(0, ge=0)
    context_window: Optional[int] = Field(None, ge=1)
    capabilities: list[str] = Field(default_factory=list)
    enabled: bool = False
    priority: int = Field(100, ge=0, le=10000)
    fallback_eligible: bool = True


class SettingUpdate(BaseModel):
    value: str = Field(..., max_length=1000)


class AuditOut(BaseModel):
    id: int
    admin_id: Optional[int]
    action: str
    target_type: Optional[str]
    target_id: Optional[str]
    safe_metadata: dict[str, Any]
    created_at: datetime


class OverviewOut(BaseModel):
    total_users: int
    active_users: int
    new_users: int
    total_projects: int
    active_admins: int
    total_credits_consumed: int
    configured_providers: int
    available_models: int
    failed_requests: int
    recent_activity: list[AuditOut]
