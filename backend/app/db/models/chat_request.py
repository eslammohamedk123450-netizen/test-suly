"""Durable request state for resumable/idempotent chat streaming."""
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.db.base import Base


class ChatRequestRecord(Base):
    __tablename__ = "chat_request_records"
    __table_args__ = (Index("uq_chat_request_user_key", "user_id", "request_key", unique=True),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    conversation_id: Mapped[Optional[int]] = mapped_column(ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True)
    request_key: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    reply: Mapped[str] = mapped_column(Text, default="", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    credit_balance: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
