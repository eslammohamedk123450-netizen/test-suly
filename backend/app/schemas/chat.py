"""Pydantic schemas for chat requests and responses."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request schema for sending a chat message.

    The message field is required, must not be empty or whitespace-only,
    and is limited to 4000 characters.
    """

    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The chat message text",
        examples=["مرحباً، كيف حالك؟"],
    )


class ChatResponse(BaseModel):
    """Response schema for chat replies."""

    reply: str = Field(..., description="The assistant's reply")
    status: str = Field(..., description="Connection status")
    provider_connected: bool = Field(
        ..., description="Whether an AI provider is connected"
    )