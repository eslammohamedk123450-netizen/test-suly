from unittest.mock import patch

from cryptography.fernet import Fernet

from backend.app.core.config import settings
from backend.app.db.models.admin import AIModel, AIProvider
from backend.app.routes.admin import setup_provider
from backend.app.schemas.admin import ProviderSetupIn
from backend.app.services.admin_security import decrypt_secret


def test_provider_setup_saves_encrypted_key_and_all_discovered_models(db_session, test_admin_user):
    settings.credential_encryption_key = Fernet.generate_key().decode()
    discovered = [
        {
            "name": "First chat model",
            "model_identifier": "first-chat",
            "description": None,
            "context_window": 8192,
            "capabilities": ["text", "chat"],
        },
        {
            "name": "Second chat model",
            "model_identifier": "second-chat",
            "description": None,
            "context_window": 16384,
            "capabilities": ["text", "chat"],
        },
    ]
    payload = ProviderSetupIn(
        name="My Groq key",
        provider_type="groq",
        api_key="secret-test-key",
    )

    with patch("backend.app.routes.admin.discover_models", return_value=discovered):
        result = setup_provider(payload, db_session, test_admin_user)

    provider = db_session.query(AIProvider).filter_by(name="My Groq key").one()
    models = (
        db_session.query(AIModel)
        .filter_by(provider_id=provider.id)
        .order_by(AIModel.priority)
        .all()
    )
    assert result.models_imported == 2
    assert result.model_names == ["First chat model", "Second chat model"]
    assert provider.enabled is True
    assert provider.base_url == "https://api.groq.com/openai/v1"
    assert provider.encrypted_api_key != "secret-test-key"
    assert decrypt_secret(provider.encrypted_api_key) == "secret-test-key"
    assert [model.model_identifier for model in models] == ["first-chat", "second-chat"]
    assert all(model.enabled and model.fallback_eligible for model in models)
