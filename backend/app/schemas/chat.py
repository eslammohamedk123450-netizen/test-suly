"""Pydantic schemas for chat requests and responses."""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[ChatTurn] = Field(default_factory=list, max_length=40)


class UsageRecordCreate(BaseModel):
    user_id: int
    provider_id: int
    model_id: int
    request_id: str
    status: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    duration_ms: float
    credits_consumed: int
    cost: float


class UsageRecordOut(UsageRecordCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class RateLimitInfo(BaseModel):
    limit: int
    remaining: int
    reset_at: str
    retry_after: Optional[int] = None


class ChatResponse(BaseModel):
    reply: str
    status: str
    provider_connected: bool
    credit_balance: int = Field(..., ge=0)


class ConversationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class ConversationCreate(ConversationBase):
    pass


class ConversationOut(ConversationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class MessageBase(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class MessageCreate(MessageBase):
    pass


class MessageOut(MessageBase):
    id: int
    conversation_id: int
    user_id: int
    tokens_used: Optional[int] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
