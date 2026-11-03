import json
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
