import json
import time
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from cryptography.fernet import Fernet
from fastapi import HTTPException

from backend.app.core.config import settings
from backend.app.services.admin_security import encrypt_secret
from backend.app.services.chat_service import ChatProviderError, ChatService


class _Response:
    def __init__(self, body: bytes):
        self._body = body

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return self._body


@pytest.mark.parametrize(
    ("provider_type", "base_url"),
    [
        ("openrouter", "https://openrouter.ai/api/v1"),
        ("deepseek", "https://api.deepseek.com"),
        ("groq", "https://api.groq.com/openai/v1"),
        ("openai", "https://api.openai.com/v1"),
        (
            "google_ai_studio",
            "https://generativelanguage.googleapis.com/v1beta/openai",
        ),
    ],
)
def test_provider_defaults_use_openai_chat_completions(provider_type, base_url):
    settings.credential_encryption_key = Fernet.generate_key().decode()
    provider = SimpleNamespace(
        provider_type=provider_type,
        base_url=None,
        encrypted_api_key=encrypt_secret("unit-test-key"),
        timeout_seconds=2,
    )
    model = SimpleNamespace(model_identifier="unit-test-model")
    response_body = json.dumps(
        {"choices": [{"message": {"content": "reply"}}]}
    ).encode()

    with patch(
        "backend.app.services.chat_service.urlopen",
        return_value=_Response(response_body),
    ) as mock_urlopen:
        result = ChatService(None)._complete(
            provider,
            model,
            "new question",
            [{"role": "user", "content": "previous question"}],
        )

    request = mock_urlopen.call_args.args[0]
    payload = json.loads(request.data)
    assert result == "reply"
    assert request.full_url == f"{base_url}/chat/completions"
    assert request.get_header("Authorization") == "Bearer unit-test-key"
    assert payload["model"] == "unit-test-model"
    assert payload["messages"] == [
        {"role": "user", "content": "previous question"},
        {"role": "user", "content": "new question"},
    ]


def test_remote_provider_rejects_plain_http():
    settings.credential_encryption_key = Fernet.generate_key().decode()
    provider = SimpleNamespace(
        provider_type="openai",
        base_url="http://api.example.com/v1",
        encrypted_api_key=encrypt_secret("unit-test-key"),
        timeout_seconds=2,
    )
    model = SimpleNamespace(model_identifier="unit-test-model")

    with pytest.raises(ChatProviderError):
        ChatService(None)._complete(provider, model, "question", [])


def test_chat_service_tries_models_sequentially_until_first_success_even_without_legacy_fallback_flag():
    from unittest.mock import MagicMock

    model_one = SimpleNamespace(priority=0, fallback_eligible=False)
    model_two = SimpleNamespace(priority=1, fallback_eligible=False)
    provider = SimpleNamespace(priority=0)
    query = MagicMock()
    query.join.return_value = query
    query.filter.return_value = query
    query.order_by.return_value = query
    query.all.return_value = [(model_one, provider), (model_two, provider)]
    db = SimpleNamespace(query=lambda *_args: query)
    service = ChatService(db)

    with patch.object(
        service,
        "_complete",
        side_effect=[ChatProviderError("first failed"), "second model replied"],
    ) as complete:
        result = service.get_reply("hello", [])

    assert result == "second model replied"
    assert complete.call_count == 2
    assert complete.call_args_list[0].args[1] is model_one
    assert complete.call_args_list[1].args[1] is model_two


class _StreamingResponse(_Response):
    def __init__(self, lines: list[bytes]):
        super().__init__(b"")
        self._lines = lines

    def __iter__(self):
        return iter(self._lines)


def test_stream_complete_yields_openai_sse_deltas():
    settings.credential_encryption_key = Fernet.generate_key().decode()
    provider = SimpleNamespace(
        provider_type="openai",
        base_url=None,
        encrypted_api_key=encrypt_secret("unit-test-key"),
        timeout_seconds=2,
    )
    model = SimpleNamespace(model_identifier="unit-test-model")
    response = _StreamingResponse([
        b'data: {"choices":[{"delta":{"content":"Hel"}}]}\n',
        b'data: {"choices":[{"delta":{"content":"lo"}}]}\n',
        b"data: [DONE]\n",
    ])
    with patch("backend.app.services.chat_service.urlopen", return_value=response):
        result = list(ChatService(None)._stream_complete(provider, model, "question", []))
    assert result == ["Hel", "lo"]


def test_provider_request_includes_image_and_text_attachments():
    settings.credential_encryption_key = Fernet.generate_key().decode()
    provider = SimpleNamespace(
        provider_type="openai",
        base_url=None,
        encrypted_api_key=encrypt_secret("unit-test-key"),
        timeout_seconds=2,
    )
    model = SimpleNamespace(model_identifier="vision-model")
    attachments = [
        {"name": "photo.png", "image_data_url": "data:image/png;base64,aGVsbG8="},
        {"name": "notes.txt", "text": "A text file"},
    ]

    request, _ = ChatService(None)._provider_request(
        provider, model, "Describe these attachments", [], stream=True,
        attachments=attachments,
    )

    payload = json.loads(request.data)
    content = payload["messages"][-1]["content"]
    assert content[0] == {"type": "text", "text": "Describe these attachments"}
    assert content[1] == {
        "type": "image_url",
        "image_url": {"url": "data:image/png;base64,aGVsbG8="},
    }
    assert "A text file" in content[2]["text"]


def test_fastest_stream_wins_and_three_slow_races_auto_disable_a_model():
    fast_model = SimpleNamespace(
        id=101, enabled=True, consecutive_failures=0, auto_disabled=False,
        last_response_latency_ms=None, last_response_status=None,
        last_response_error=None, last_response_at=None,
    )
    slow_model = SimpleNamespace(
        id=102, enabled=True, consecutive_failures=0, auto_disabled=False,
        last_response_latency_ms=None, last_response_status=None,
        last_response_error=None, last_response_at=None,
    )
    db = SimpleNamespace(commit=lambda: None)
    service = ChatService(db)
    provider = SimpleNamespace()
    service._candidates = lambda: [(fast_model, provider), (slow_model, provider)]

    def mock_stream(_provider, model, *_args, **_kwargs):
        if model.id == fast_model.id:
            yield "fast"
            yield " reply"
        else:
            time.sleep(0.08)
            yield "late"

    with patch.object(service, "_stream_complete", side_effect=mock_stream):
        for _ in range(3):
            assert "".join(service.stream_reply_fastest("question", first_token_timeout=0.03)) == "fast reply"

    assert fast_model.last_response_status == "fast"
    assert fast_model.consecutive_failures == 0
    assert slow_model.last_response_status == "slow"
    assert slow_model.consecutive_failures == 3
    assert slow_model.enabled is False
    assert slow_model.auto_disabled is True
