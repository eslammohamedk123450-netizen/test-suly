from fastapi.testclient import TestClient

from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.main import app


def test_registration_login_and_credit_endpoints_use_real_ledger(override_get_db):
    settings.secret_key = "unit-test-secret-that-is-not-used-in-production"
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    try:
        registered = client.post(
            "/api/v1/auth/register",
            json={
                "email": "credits@example.com",
                "password": "strong-test-password",
                "full_name": "Credit Test",
            },
        )
        assert registered.status_code == 200
        assert registered.json()["credit_balance"] == 1000

        login = client.post(
            "/api/v1/auth/login",
            json={"email": "credits@example.com", "password": "strong-test-password"},
        )
        assert login.status_code == 200
        assert login.json()["credit_balance"] == 1000
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

        balance = client.get("/api/v1/auth/credits/balance", headers=headers)
        assert balance.status_code == 200
        assert balance.json()["balance"] == 1000

        history = client.get("/api/v1/auth/credits/history", headers=headers)
        assert history.status_code == 200
        assert len(history.json()) == 1
        assert history.json()[0]["amount"] == 1000

        daily = client.post("/api/v1/auth/credits/daily-bonus", headers=headers)
        assert daily.status_code == 200
        assert daily.json()["awarded_today"] is False
        assert daily.json()["balance"] == 1000
    finally:
        app.dependency_overrides.pop(get_db, None)
