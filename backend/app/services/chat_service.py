"""Service for chat message handling.

Provides mock reply logic for the chat endpoint.
No AI provider is connected at this stage.
"""


class ChatService:
    """Handles chat business logic.

    Currently returns a mock reply confirming the message was received
    by the SULY backend. No AI provider integration is implemented yet.
    """

    MOCK_REPLY_AR = (
        "وصلت رسالتك إلى SULY Backend بنجاح. "
        "لم يتم ربط نموذج ذكاء اصطناعي بعد."
    )

    def get_mock_reply(self) -> str:
        """Return the mock chat reply in Arabic."""
        return self.MOCK_REPLY_AR