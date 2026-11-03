from datetime import datetime, timezone

from sqlalchemy import func

from backend.app.auth.service import AuthService
from backend.app.db.models.admin import CreditTransaction
from backend.app.db.models.user import User


def test_registration_grants_exactly_1000_credits_and_ledger_entry(db_session):
    user = AuthService(db_session).register(
        "New.User@example.com",
        "a-secure-password",
        "New User",
    )

    assert user.email == "new.user@example.com"
    assert user.credit_balance == 1000
    transactions = (
        db_session.query(CreditTransaction)
        .filter(CreditTransaction.user_id == user.id)
        .all()
    )
    assert len(transactions) == 1
    assert transactions[0].amount == 1000
    assert transactions[0].balance_after == 1000
    assert transactions[0].reason == "registration_bonus"
    assert transactions[0].idempotency_key == f"registration:{user.id}"


def test_daily_bonus_is_awarded_once_per_cairo_day(db_session):
    user = User(
        email="older-user@example.com",
        hashed_password="unused-in-this-test",
        is_active=True,
        is_admin=False,
        credit_balance=1000,
        created_at=datetime(2026, 11, 1, 10, tzinfo=timezone.utc),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    service = AuthService(db_session)
    # 22:00 UTC is midnight in Cairo in November.
    now = datetime(2026, 11, 2, 22, 0, tzinfo=timezone.utc)
    assert service.award_daily_bonus(user, now=now) is True
    assert user.credit_balance == 1200
    assert service.award_daily_bonus(user, now=now) is False
    assert user.credit_balance == 1200
    assert service.has_daily_bonus_today(user, now=now) is True

    count = (
        db_session.query(func.count(CreditTransaction.id))
        .filter(
            CreditTransaction.user_id == user.id,
            CreditTransaction.reason == "daily_bonus",
        )
        .scalar()
    )
    assert count == 1


def test_new_user_does_not_receive_daily_bonus_before_first_midnight(db_session):
    user = User(
        email="new-today@example.com",
        hashed_password="unused-in-this-test",
        is_active=True,
        is_admin=False,
        credit_balance=1000,
        created_at=datetime(2026, 11, 2, 9, tzinfo=timezone.utc),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    service = AuthService(db_session)
    signup_day = datetime(2026, 11, 2, 20, 0, tzinfo=timezone.utc)
    assert service.award_daily_bonus(user, now=signup_day) is False
    assert user.credit_balance == 1000
    assert service.has_daily_bonus_today(user, now=signup_day) is False

    next_cairo_day = datetime(2026, 11, 2, 22, 0, tzinfo=timezone.utc)
    assert service.award_daily_bonus(user, now=next_cairo_day) is True
    assert user.credit_balance == 1200


def test_admin_accounts_do_not_receive_user_daily_bonus(db_session):
    admin = User(
        email="admin-rewards@example.com",
        hashed_password="unused-in-this-test",
        is_active=True,
        is_admin=True,
        credit_balance=0,
        created_at=datetime(2026, 10, 1, tzinfo=timezone.utc),
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)

    awarded = AuthService(db_session).award_daily_bonus(
        admin,
        now=datetime(2026, 11, 2, 22, 0, tzinfo=timezone.utc),
    )
    assert awarded is False
    assert admin.credit_balance == 0
