import json
from unittest.mock import patch

from backend.app.services.provider_catalog import discover_models


class _Response:
    def __init__(self, body):
        self.body = json.dumps(body).encode()

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return self.body


def test_groq_catalog_imports_active_models_without_guessing_from_name_or_context():
    payload = {
        "object": "list",
        "data": [
            {"id": "llama-3.1-8b-instant", "active": True, "context_window": 131072},
            {"id": "whisper-large-v3", "active": True, "context_window": 448},
            {"id": "gpt-retired", "active": False, "context_window": 8192},
        ],
    }
    with patch("backend.app.services.provider_catalog.urlopen", return_value=_Response(payload)) as fetch:
        models = discover_models("groq", "test-key")

    assert [model["model_identifier"] for model in models] == [
        "llama-3.1-8b-instant",
        "whisper-large-v3",
    ]
    request = fetch.call_args.args[0]
    assert request.full_url == "https://api.groq.com/openai/v1/models"
    assert request.get_header("Authorization") == "Bearer test-key"


def test_openrouter_catalog_only_imports_text_output_models():
    payload = {
        "data": [
            {
                "id": "vendor/chat-model",
                "name": "Chat model",
                "architecture": {"input_modalities": ["text"], "output_modalities": ["text"]},
                "context_length": 32768,
            },
            {
                "id": "vendor/image-model",
                "architecture": {"input_modalities": ["text"], "output_modalities": ["image"]},
                "context_length": 4096,
            },
        ]
    }
    with patch("backend.app.services.provider_catalog.urlopen", return_value=_Response(payload)) as fetch:
        models = discover_models("openrouter", "test-key")

    assert [model["model_identifier"] for model in models] == ["vendor/chat-model"]
    assert "output_modalities=text" in fetch.call_args.args[0].full_url


def test_gemini_catalog_uses_generate_content_models_and_base_model_id():
    payload = {
        "models": [
            {
                "name": "models/gemini-2.5-flash-preview",
                "baseModelId": "gemini-2.5-flash-preview",
                "displayName": "Gemini Flash Preview",
                "inputTokenLimit": 100000,
                "supportedGenerationMethods": ["generateContent"],
            },
            {
                "name": "models/text-embedding-004",
                "baseModelId": "text-embedding-004",
                "supportedGenerationMethods": ["embedContent"],
            },
        ]
    }
    with patch("backend.app.services.provider_catalog.urlopen", return_value=_Response(payload)) as fetch:
        models = discover_models("google_ai_studio", "google-key")

    assert [model["model_identifier"] for model in models] == ["gemini-2.5-flash-preview"]
    request = fetch.call_args.args[0]
    assert request.get_header("X-goog-api-key") == "google-key"
