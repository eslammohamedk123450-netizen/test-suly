"""Provider-backed chat service using configured OpenAI-compatible endpoints."""
import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from sqlalchemy.orm import Session

from backend.app.db.models.admin import AIModel, AIProvider
from backend.app.services.admin_security import decrypt_secret


class ChatProviderError(RuntimeError):
    """Raised when no configured provider can produce a safe chat response."""


class ChatService:
    """Select an enabled model and send a single-turn chat completion request."""

    PROVIDER_BASE_URLS = {
        "openai": "https://api.openai.com/v1",
        "openai_compatible": "https://api.openai.com/v1",
        "openrouter": "https://openrouter.ai/api/v1",
        "deepseek": "https://api.deepseek.com",
        "groq": "https://api.groq.com/openai/v1",
        "google_ai_studio": "https://generativelanguage.googleapis.com/v1beta/openai",
    }

    def __init__(self, db: Session):
        self.db = db

    def get_reply(self, message: str, history: list[dict[str, str]] | None = None) -> str:
        candidates = (
            self.db.query(AIModel, AIProvider)
            .join(AIProvider, AIModel.provider_id == AIProvider.id)
            .filter(AIModel.enabled.is_(True), AIProvider.enabled.is_(True))
            .order_by(AIModel.priority.asc(), AIProvider.priority.asc(), AIModel.id.asc())
            .all()
        )
        if not candidates:
            raise ChatProviderError("No enabled AI provider/model is configured.")

        for index, (model, provider) in enumerate(candidates):
            try:
                return self._complete(provider, model, message, history or [])
            except (
                RuntimeError,
                HTTPError,
                URLError,
                TimeoutError,
                ValueError,
                KeyError,
                IndexError,
                TypeError,
            ):
                # Try the next configured model only when fallback is explicitly allowed.
                if index + 1 >= len(candidates) or not model.fallback_eligible:
                    break
        raise ChatProviderError("All configured AI providers failed to answer.")

    def _complete(
        self,
        provider: AIProvider,
        model: AIModel,
        message: str,
        history: list[dict[str, str]],
    ) -> str:
        provider_type = provider.provider_type.strip().lower().replace("-", "_").replace(" ", "_")
        if provider_type in {"googleaistudio", "gemini"}:
            provider_type = "google_ai_studio"
        if provider_type == "openai_compat":
            provider_type = "openai_compatible"
        if provider_type not in self.PROVIDER_BASE_URLS:
            raise ChatProviderError("This provider protocol is not supported by chat yet.")
        if not provider.encrypted_api_key:
            raise ChatProviderError("The configured provider has no API key.")

        base_url = (
            provider.base_url or self.PROVIDER_BASE_URLS[provider_type]
        ).rstrip("/")
        parsed = urlsplit(base_url)
        if parsed.scheme not in {"https", "http"} or not parsed.netloc:
            raise ChatProviderError("The configured provider URL is invalid.")
        local_hosts = {"localhost", "127.0.0.1", "::1"}
        if parsed.scheme != "https" and (parsed.hostname or "").lower() not in local_hosts:
            raise ChatProviderError("HTTPS is required for remote AI providers.")
        endpoint = base_url if base_url.endswith("/chat/completions") else f"{base_url}/chat/completions"
        api_key = decrypt_secret(provider.encrypted_api_key)
        messages = [
            {"role": turn["role"], "content": turn["content"]}
            for turn in history[-40:]
        ]
        messages.append({"role": "user", "content": message})
        payload = json.dumps({
            "model": model.model_identifier,
            "messages": messages,
            "stream": False,
        }).encode("utf-8")
        request = Request(
            endpoint,
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        )
        with urlopen(request, timeout=provider.timeout_seconds) as response:
            data = json.loads(response.read().decode("utf-8"))
        reply = data["choices"][0]["message"]["content"]
        if not isinstance(reply, str) or not reply.strip():
            raise ChatProviderError("The provider returned an empty response.")
        return reply.strip()
