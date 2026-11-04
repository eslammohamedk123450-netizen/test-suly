from unittest.mock import patch

from cryptography.fernet import Fernet

from backend.app.core.config import settings
from backend.app.db.models.admin import AIModel, AIProvider
from backend.app.routes.admin import setup_provider, update_model_enabled, update_model_priority
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


def test_admin_can_update_model_priority_and_audit_it(db_session, test_model, test_admin_user):
    test_model.priority = 1
    neighbor = AIModel(
        name="neighbor", provider_id=test_model.provider_id,
        model_identifier="neighbor-id", enabled=True, priority=0,
    )
    db_session.add(neighbor)
    db_session.commit()
    result = update_model_priority(test_model.id, test_model.priority - 1, db_session, test_admin_user)
    db_session.refresh(test_model)
    db_session.refresh(neighbor)
    assert result == {"id": test_model.id, "priority": 0}
    assert test_model.priority == 0
    assert neighbor.priority == 1


def test_admin_can_reenable_auto_disabled_model(db_session, test_model, test_admin_user):
    test_model.enabled = False
    test_model.auto_disabled = True
    test_model.consecutive_failures = 3
    db_session.commit()

    result = update_model_enabled(test_model.id, True, db_session, test_admin_user)

    assert result["enabled"] is True
    assert result["auto_disabled"] is False
    assert test_model.consecutive_failures == 0
