
"""Chat API routes backed by configured AI providers."""
import json
from time import perf_counter
from uuid import uuid4
from datetime import datetime, timezone
from collections.abc import Iterator

from fastapi import APIRouter, Body, Depends, Header, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import update
from sqlalchemy.orm import Session

from backend.app.auth.router import get_current_user_record
from backend.app.db.models.admin import AIModel, AIProvider, Conversation, CreditTransaction, Message
from backend.app.db.models.chat_request import ChatRequestRecord
from backend.app.db.models.usage import UsageRecord
from backend.app.db.models.user import User
from backend.app.db.session import get_db
from backend.app.schemas.chat import ChatRequest, ChatResponse, ConversationOut, MessageOut
from backend.app.services.chat_service import ChatProviderError, ChatService
from backend.app.services.rate_limiter import RateLimiter

router = APIRouter(prefix="/chat", tags=["Chat"])
_rate_limiter = RateLimiter(limit=100, period=3600)


def check_rate_limit(user: User = Depends(get_current_user_record)):
    allowed, info = _rate_limiter.check(user.id)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
            headers={
                "X-Rate-Limit-Limit": str(info.limit),
                "X-Rate-Limit-Remaining": str(info.remaining),
                "X-Rate-Limit-Reset": str(info.reset_at),
                "Retry-After": str(info.retry_after or ""),
            },
        )
    return info


def _conversation_or_404(db: Session, conversation_id: int, user_id: int) -> Conversation:
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id,
    ).first()
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied",
        )
    return conversation


@router.post("/", response_model=ChatResponse, summary="Send a chat message")
def chat(
    request: ChatRequest,
    conversation_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
    _rate_info=Depends(check_rate_limit),
) -> ChatResponse:
    message_text = request.message.strip()
    if not message_text:
        raise HTTPException(status_code=422, detail="Message cannot be empty")

    conversation = (
        _conversation_or_404(db, conversation_id, current_user.id)
        if conversation_id is not None
        else Conversation(user_id=current_user.id, title="محادثة جديدة"))
    if conversation.id is None:
        db.add(conversation)
        db.flush()

    recent_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(40)
        .all()
    )
    history = [
        {"role": item.role, "content": item.content}
        for item in reversed(recent_messages)
    ]
    if request.history:
        history = [item.model_dump() for item in request.history][-40:]

    try:
        reply = ChatService(db).get_reply(message_text, history)
    except ChatProviderError:
        # All providers failed - no deduction, no response added
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="All AI providers failed to generate a response. Please try again later.",
        )
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable.",
        ) from exc

    # Atomically reserve one credit after a successful provider response.
    result = db.execute(
        update(User)
        .where(User.id == current_user.id, User.credit_balance >= 1)
        .values(credit_balance=User.credit_balance - 1)
        .returning(User.credit_balance)
    )
    new_balance = result.scalar_one_or_none()
    if new_balance is None:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credit balance. Please add credits to continue.",
        )
    current_user.credit_balance = new_balance

    db.add(Message(
        conversation_id=conversation.id,
        user_id=current_user.id,
        role="user",
        content=message_text,
    ))
    db.add(Message(
        conversation_id=conversation.id,
        user_id=current_user.id,
        role="assistant",
        content=reply,
    ))
    db.add(CreditTransaction(
        user_id=current_user.id,
        amount=-1,
        balance_after=new_balance,
        reason="AI chat request",
    ))
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()

    return ChatResponse(
        reply=reply,
        status="success",
        provider_connected=True,
        credit_balance=new_balance,
    )


@router.post("/stream", summary="Stream a chat response")
def stream_chat(
    request: ChatRequest,
    conversation_id: int | None = None,
    regenerate: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
    _rate_info=Depends(check_rate_limit),
    x_request_id: str | None = Header(default=None, alias="X-Request-ID"),
) -> StreamingResponse:
    """Stream SSE deltas with durable request state and idempotent charging."""
    message_text = request.message.strip()
    if not message_text:
        raise HTTPException(status_code=422, detail="Message cannot be empty")
    if current_user.credit_balance < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credit balance. Please add credits to continue.",
        )

    if regenerate and conversation_id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A conversation is required when regenerating a response.",
        )
    request_key = (x_request_id or uuid4().hex).strip()
    if not request_key or len(request_key) > 255:
        raise HTTPException(status_code=422, detail="X-Request-ID must contain 1-255 characters")
    existing = db.query(ChatRequestRecord).filter(
        ChatRequestRecord.user_id == current_user.id,
        ChatRequestRecord.request_key == request_key,
    ).first()
    if existing is not None:
        if existing.status == "completed" or (existing.reply and existing.credit_balance is not None):
            payload = json.dumps({"delta": existing.reply}, ensure_ascii=False)
            done = json.dumps({"done": True, "credit_balance": existing.credit_balance}, ensure_ascii=False)
            return StreamingResponse(iter([f"data: {payload}\n\ndata: {done}\n\n"]), media_type="text/event-stream")
        raise HTTPException(status_code=409, detail="This request is already in progress or failed; use a new X-Request-ID")
    conversation = (
        _conversation_or_404(db, conversation_id, current_user.id)
        if conversation_id is not None
        else Conversation(user_id=current_user.id, title="محادثة جديدة")
    )
    if conversation.id is None:
        db.add(conversation)
        db.flush()
    request_record = ChatRequestRecord(
        user_id=current_user.id,
        conversation_id=conversation.id,
        request_key=request_key,
        message=message_text,
        status="streaming",
    )
    db.add(request_record)
    db.flush()
    request_record_id = request_record.id
    db.commit()
    started_at = perf_counter()
    user_id = current_user.id
    recent_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(40)
        .all()
    )
    history = [
        {"role": item.role, "content": item.content}
        for item in reversed(recent_messages)
    ]
    if request.history:
        history = [item.model_dump() for item in request.history][-40:]

    def events() -> Iterator[str]:
        chunks: list[str] = []
        try:
            for delta in ChatService(db).stream_reply(message_text, history):
                chunks.append(delta)
                yield f"data: {json.dumps({'delta': delta}, ensure_ascii=False)}\n\n"
            reply = "".join(chunks).strip()
            if not reply:
                raise ChatProviderError("The provider returned an empty response.")
            result = db.execute(
                update(User)
                .where(User.id == user_id, User.credit_balance >= 1)
                .values(credit_balance=User.credit_balance - 1)
                .returning(User.credit_balance)
            )
            new_balance = result.scalar_one_or_none()
            if new_balance is None:
                db.rollback()
                yield f"data: {json.dumps({'error': 'Insufficient credit balance.'})}\n\n"
                return
            db.execute(
                update(ChatRequestRecord)
                .where(ChatRequestRecord.id == request_record_id)
                .values(reply=reply, status="completed", credit_balance=new_balance)
            )
            if not regenerate:
                db.add(Message(
                    conversation_id=conversation.id,
                    user_id=user_id,
                    role="user",
                    content=message_text,
                ))
            db.add(Message(
                conversation_id=conversation.id,
                user_id=user_id,
                role="assistant",
                content=reply,
            ))
            db.add(CreditTransaction(
                user_id=user_id,
                amount=-1,
                balance_after=new_balance,
                reason="AI chat request",
                idempotency_key=f"chat:{user_id}:{request_key}",
            ))
            db.add(UsageRecord(
                user_id=user_id,
                request_id=request_key,
                operation="chat_stream",
                status="completed",
                duration_ms=(perf_counter() - started_at) * 1000,
                credits_consumed=1,
            ))
            conversation.updated_at = datetime.now(timezone.utc)
            db.commit()
            yield f"data: {json.dumps({'done': True, 'credit_balance': new_balance})}\n\n"
        except Exception as exc:
            db.rollback()
            if chunks:
                db.execute(
                    update(ChatRequestRecord)
                    .where(ChatRequestRecord.id == request_record_id)
                    .values(reply="".join(chunks), status="failed")
                )
                db.add(UsageRecord(
                    user_id=user_id,
                    request_id=request_key,
                    operation="chat_stream",
                    status="failed",
                    duration_ms=(perf_counter() - started_at) * 1000,
                    credits_consumed=0,
                ))
                db.commit()
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
        finally:
            db.close()

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/conversations", response_model=ConversationOut)
def create_conversation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
) -> ConversationOut:
    conversation = Conversation(user_id=current_user.id, title="محادثة جديدة")
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return ConversationOut.model_validate(conversation)


@router.get("/conversations", response_model=list[ConversationOut])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
) -> list[ConversationOut]:
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()
    return [ConversationOut.model_validate(item) for item in conversations]


@router.get("/conversations/{conversation_id}", response_model=ConversationOut)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
) -> ConversationOut:
    return ConversationOut.model_validate(
        _conversation_or_404(db, conversation_id, current_user.id)
    )


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
) -> list[MessageOut]:
    conversation = _conversation_or_404(db, conversation_id, current_user.id)
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at.asc()).all()
    return [MessageOut.model_validate(item) for item in messages]


@router.patch("/conversations/{conversation_id}/rename", response_model=ConversationOut)
def rename_conversation(
    conversation_id: int,
    new_title: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
) -> ConversationOut:
    conversation = _conversation_or_404(db, conversation_id, current_user.id)
    title = new_title.strip()
    if not title or len(title) > 255:
        raise HTTPException(status_code=422, detail="Title must contain 1-255 characters")
    conversation.title = title
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(conversation)
    return ConversationOut.model_validate(conversation)


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_record),
) -> None:
    conversation = _conversation_or_404(db, conversation_id, current_user.id)
    db.delete(conversation)
    db.commit()
