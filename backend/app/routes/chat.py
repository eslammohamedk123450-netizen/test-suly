"""Chat routes.

Exposes a POST endpoint under /api/v1/chat for receiving chat messages
and returning a mock reply confirming backend connectivity.
"""

from fastapi import APIRouter

from backend.app.schemas.chat import ChatRequest, ChatResponse
from backend.app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post(
    "/",
    response_model=ChatResponse,
    summary="Send a chat message",
    tags=["Chat"],
)
def chat(request: ChatRequest) -> ChatResponse:
    """Receive a chat message and return a mock reply.

    Validates the incoming message using the ChatRequest schema.
    Returns HTTP 422 for invalid input via FastAPI/Pydantic validation.
    """
    chat_service = ChatService()
    reply = chat_service.get_mock_reply()

    return ChatResponse(
        reply=reply,
        status="success",
        provider_connected=False,
    )