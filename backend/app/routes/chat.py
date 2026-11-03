"""Chat API routes backed by configured AI providers."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.auth.router import get_current_user_record
from backend.app.db.session import get_db
from backend.app.db.models.user import User
from backend.app.schemas.chat import ChatRequest, ChatResponse
from backend.app.services.chat_service import ChatProviderError, ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post(
    "/",
    response_model=ChatResponse,
    summary="Send a chat message to the configured AI provider",
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user_record),
) -> ChatResponse:
    try:
        history = [turn.model_dump() for turn in request.history]
        reply = ChatService(db).get_reply(request.message.strip(), history)
    except ChatProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured or is temporarily unavailable.",
        ) from exc
    except Exception as exc:
        # Do not expose provider URLs, credentials, or upstream response bodies.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable.",
        ) from exc
    return ChatResponse(reply=reply, status="success", provider_connected=True)
