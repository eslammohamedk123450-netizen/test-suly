"""Provider-backed chat service using configured OpenAI-compatible endpoints."""
from collections.abc import Iterator
import json
import queue
import threading
import time
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from sqlalchemy.orm import Session

from backend.app.db.models.admin import AIModel, AIProvider
from backend.app.services.admin_security import decrypt_secret
from backend.app.services.provider_catalog import PROVIDER_BASE_URLS as CATALOG_BASE_URLS


class ChatProviderError(RuntimeError):
    """Raised when no configured provider can produce a safe chat response."""


class ChatService:
    """Select enabled models and send chat completion requests."""

    PROVIDER_BASE_URLS = {
        **CATALOG_BASE_URLS,
        "openai_compatible": "https://api.openai.com/v1",
    }
    _RETRYABLE_ERRORS = (
        RuntimeError,
        HTTPError,
        URLError,
        TimeoutError,
        ValueError,
        KeyError,
        IndexError,
        TypeError,
        json.JSONDecodeError,
    )

    def __init__(self, db: Session):
        self.db = db

    def _candidates(self) -> list[tuple[AIModel, AIProvider]]:
        return (
            self.db.query(AIModel, AIProvider)
            .join(AIProvider, AIModel.provider_id == AIProvider.id)
            .filter(AIModel.enabled.is_(True), AIProvider.enabled.is_(True))
            .order_by(AIProvider.priority.asc(), AIModel.priority.asc(), AIModel.id.asc())
            .all()
        )

    def get_reply(self, message: str, history: list[dict[str, str]] | None = None, attachments: list[dict] | None = None) -> str:
        candidates = self._candidates()
        if not candidates:
            raise ChatProviderError("No enabled AI provider/model is configured.")
        for model, provider in candidates:
            try:
                return self._complete(provider, model, message, history or [], attachments or [])
            except self._RETRYABLE_ERRORS:
                continue
        raise ChatProviderError("All configured AI providers failed to answer.")

    def stream_reply(
        self,
        message: str,
        history: list[dict[str, str]] | None = None,
        attachments: list[dict] | None = None,
    ) -> Iterator[str]:
        """Yield provider text deltas, falling back only before output starts."""
        candidates = self._candidates()
        if not candidates:
            raise ChatProviderError("No enabled AI provider/model is configured.")
        for model, provider in candidates:
            emitted = False
            try:
                for delta in self._stream_complete(provider, model, message, history or [], attachments or []):
                    emitted = True
                    yield delta
                return
            except self._RETRYABLE_ERRORS:
                if emitted:
                    raise
                continue
        raise ChatProviderError("All configured AI providers failed to stream a response.")

    def get_reply_fastest(
        self,
        message: str,
        history: list[dict[str, str]] | None = None,
        attachments: list[dict] | None = None,
    ) -> str:
        return "".join(self.stream_reply_fastest(message, history, attachments))

    def stream_reply_fastest(
        self,
        message: str,
        history: list[dict[str, str]] | None = None,
        attachments: list[dict] | None = None,
        *,
        first_token_timeout: float = 3.0,
    ) -> Iterator[str]:
        """Race every enabled model; stream the first model's response immediately.

        Each provider gets one request. A model is considered fast when it emits
        its first text delta inside the shared deadline. Slow/error streaks are
        persisted and quarantined after three consecutive misses.
        """
        candidates = self._candidates()
        if not candidates:
            raise ChatProviderError("No enabled AI provider/model is configured.")

        events: queue.Queue = queue.Queue()
        winner_decided = threading.Event()
        winner_lock = threading.Lock()
        winner_ref: dict[str, int | None] = {"id": None}
        started = time.monotonic()
        deadline = started + first_token_timeout
        first_seen: dict[int, float] = {}
        failures: dict[int, str] = {}
        ended: set[int] = set()
        models = {model.id: model for model, _ in candidates}

        def worker(model: AIModel, provider: AIProvider) -> None:
            first_delta = True
            try:
                for delta in self._stream_complete(
                    provider, model, message, history or [], attachments or [],
                    first_token_timeout=first_token_timeout,
                ):
                    now = time.monotonic()
                    events.put(("delta", model.id, delta, now))
                    if first_delta:
                        first_delta = False
                        # The coordinator identifies the winner before a losing
                        # stream is allowed to generate another chunk.
                        winner_decided.wait(timeout=first_token_timeout)
                    with winner_lock:
                        selected = winner_ref["id"]
                    if selected is not None and selected != model.id:
                        break
                events.put(("end", model.id, None, time.monotonic()))
            except Exception as exc:
                events.put(("error", model.id, str(exc)[:500], time.monotonic()))

        for model, provider in candidates:
            threading.Thread(
                target=worker, args=(model, provider), daemon=True,
                name=f"suly-model-race-{model.id}",
            ).start()

        winner_id: int | None = None
        winner_ended = False
        health_recorded = False
        failed_without_response = False

        def record_health() -> None:
            nonlocal health_recorded
            if health_recorded:
                return
            now = datetime.now(timezone.utc)
            for model_id, model in models.items():
                latency = first_seen.get(model_id)
                if latency is not None and latency <= first_token_timeout and model_id not in failures:
                    model.last_response_latency_ms = round(latency * 1000, 1)
                    model.last_response_status = "fast"
                    model.last_response_error = None
                    model.last_response_at = now
                    model.consecutive_failures = 0
                    model.auto_disabled = False
                else:
                    model.consecutive_failures = int(model.consecutive_failures or 0) + 1
                    model.last_response_latency_ms = round((latency or max(0.0, time.monotonic() - started)) * 1000, 1)
                    model.last_response_status = "error" if model_id in failures else "slow"
                    model.last_response_error = failures.get(model_id) or f"No first token within {first_token_timeout:g} seconds"
                    model.last_response_at = now
                    if model.consecutive_failures >= 3:
                        model.enabled = False
                        model.auto_disabled = True
            self.db.commit()
            health_recorded = True

        while True:
            now = time.monotonic()
            all_resolved = len(set(first_seen) | set(failures)) >= len(candidates)
            if not health_recorded and all_resolved:
                record_health()
            if winner_id is not None and winner_ended and health_recorded:
                winner_decided.set()
                break

            wait = 0.1
            if not health_recorded:
                wait = max(0.001, min(wait, max(0.001, deadline - now)))
            try:
                kind, model_id, value, timestamp = events.get(timeout=wait)
            except queue.Empty:
                now = time.monotonic()
                if not health_recorded and now >= deadline:
                    record_health()
                if winner_id is None and now >= deadline:
                    winner_decided.set()
                    failed_without_response = True
                    break
                continue

            if kind == "delta":
                first = model_id not in first_seen
                if first:
                    first_seen[model_id] = max(0.0, timestamp - started)
                    if winner_id is None and timestamp <= deadline:
                        winner_id = model_id
                        with winner_lock:
                            winner_ref["id"] = model_id
                        winner_decided.set()
                if model_id == winner_id:
                    yield value
            elif kind == "error":
                failures.setdefault(model_id, value or "Provider failed")
                if model_id == winner_id:
                    winner_ended = True
            elif kind == "end":
                ended.add(model_id)
                if model_id == winner_id:
                    winner_ended = True

        winner_decided.set()
        if failed_without_response or winner_id is None:
            raise ChatProviderError(
                f"No enabled model produced a first response within {first_token_timeout:g} seconds."
            )
        if winner_id in failures:
            raise ChatProviderError(f"Selected model failed: {failures[winner_id]}")

    def _provider_request(
        self,
        provider: AIProvider,
        model: AIModel,
        message: str,
        history: list[dict[str, str]],
        *,
        stream: bool,
        attachments: list[dict] | None = None,
    ) -> tuple[Request, int]:
        provider_type = provider.provider_type.strip().lower().replace("-", "_").replace(" ", "_")
        if provider_type in {"googleaistudio", "gemini"}:
            provider_type = "google_ai_studio"
        if provider_type == "openai_compat":
            provider_type = "openai_compatible"
        if provider_type not in self.PROVIDER_BASE_URLS:
            raise ChatProviderError("This provider protocol is not supported by chat yet.")
        if not provider.encrypted_api_key:
            raise ChatProviderError("The configured provider has no API key.")
        base_url = (provider.base_url or self.PROVIDER_BASE_URLS[provider_type]).rstrip("/")
        parsed = urlsplit(base_url)
        if parsed.scheme not in {"https", "http"} or not parsed.netloc:
            raise ChatProviderError("The configured provider URL is invalid.")
        local_hosts = {"localhost", "127.0.0.1", "::1"}
        if parsed.scheme != "https" and (parsed.hostname or "").lower() not in local_hosts:
            raise ChatProviderError("HTTPS is required for remote AI providers.")
        endpoint = base_url if base_url.endswith("/chat/completions") else f"{base_url}/chat/completions"
        messages = [{"role": turn["role"], "content": turn["content"]} for turn in history[-40:]]
        if attachments:
            content: list[dict] = [{"type": "text", "text": message}]
            for attachment in attachments:
                if attachment.get("image_data_url"):
                    content.append({"type": "image_url", "image_url": {"url": attachment["image_data_url"]}})
                elif attachment.get("text"):
                    content.append({"type": "text", "text": f"\n\n[Attached file: {attachment.get('name', 'file')}]\n{attachment['text']}"})
            messages.append({"role": "user", "content": content})
        else:
            messages.append({"role": "user", "content": message})
        payload = json.dumps({
            "model": model.model_identifier,
            "messages": messages,
            "stream": stream,
        }).encode("utf-8")
        request = Request(
            endpoint,
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {decrypt_secret(provider.encrypted_api_key)}",
                "Content-Type": "application/json",
                "Accept": "text/event-stream" if stream else "application/json",
            },
        )
        return request, provider.timeout_seconds

    def _complete(
        self,
        provider: AIProvider,
        model: AIModel,
        message: str,
        history: list[dict[str, str]],
        attachments: list[dict] | None = None,
    ) -> str:
        request, timeout = self._provider_request(provider, model, message, history, stream=False, attachments=attachments)
        with urlopen(request, timeout=timeout) as response:
            data = json.loads(response.read().decode("utf-8"))
        reply = data["choices"][0]["message"]["content"]
        if not isinstance(reply, str) or not reply.strip():
            raise ChatProviderError("The provider returned an empty response.")
        return reply.strip()

    def _stream_complete(
        self,
        provider: AIProvider,
        model: AIModel,
        message: str,
        history: list[dict[str, str]],
        attachments: list[dict] | None = None,
        *,
        first_token_timeout: float | None = None,
    ) -> Iterator[str]:
        request, timeout = self._provider_request(provider, model, message, history, stream=True, attachments=attachments)
        initial_timeout = min(timeout, first_token_timeout) if first_token_timeout is not None else timeout
        chunks: list[str] = []
        with urlopen(request, timeout=initial_timeout) as response:
            for raw_line in response:
                line = raw_line.decode("utf-8", errors="replace").strip()
                if not line or line.startswith(":"):
                    continue
                if line.startswith("data:"):
                    line = line[5:].strip()
                if line == "[DONE]":
                    break
                data = json.loads(line)
                choices = data.get("choices") or []
                if not choices:
                    continue
                choice = choices[0]
                delta = choice.get("delta") or {}
                text = delta.get("content")
                if text is None:
                    text = (choice.get("message") or {}).get("content")
                if isinstance(text, str) and text:
                    chunks.append(text)
                    if chunks and first_token_timeout is not None:
                        try:
                            response.fp.raw._sock.settimeout(timeout)
                        except (AttributeError, OSError):
                            pass
                    yield text
        if not chunks:
            raise ChatProviderError("The provider returned an empty streamed response.")
