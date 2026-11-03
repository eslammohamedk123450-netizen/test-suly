"""Tests for credit protection, rate limiting, and usage tracking."""
from sqlalchemy import func

from backend.app.db.models.admin import CreditTransaction
from backend.app.services.rate_limiter import RateLimiter


def test_rate_limiter_init():
    limiter = RateLimiter(limit=10, period=60)
    assert limiter.limit == 10
    assert limiter.period == 60


def test_rate_limiter_allows_within_limit():
    limiter = RateLimiter(limit=5, period=60)
    for _ in range(5):
        allowed, info = limiter.check(user_id=1)
        assert allowed is True
        assert info.remaining >= 0


def test_rate_limiter_blocks_exceeding_limit():
    limiter = RateLimiter(limit=3, period=60)
    for _ in range(3):
        allowed, _ = limiter.check(user_id=1)
        assert allowed is True
    allowed, info = limiter.check(user_id=1)
    assert allowed is False
    assert info.remaining == 0
    assert info.retry_after is not None


def test_rate_limiter_is_per_user():
    limiter = RateLimiter(limit=2, period=60)
    for user_id in (1, 2):
        for _ in range(2):
            allowed, _ = limiter.check(user_id=user_id)
            assert allowed is True


def test_credit_transaction_logging(db_session, test_user):
    transaction = CreditTransaction(
        user_id=test_user.id,
        amount=-10,
        balance_after=90,
        reason="Test credit deduction",
    )
    db_session.add(transaction)
    db_session.commit()
    assert db_session.query(func.count(CreditTransaction.id)).scalar() == 1


def test_credit_balance_fixture_is_non_negative(test_user):
    assert test_user.credit_balance >= 0


def test_credit_transaction_has_required_fields():
    assert hasattr(CreditTransaction, "user_id")
    assert hasattr(CreditTransaction, "amount")
    assert hasattr(CreditTransaction, "balance_after")
    assert hasattr(CreditTransaction, "reason")
    assert hasattr(CreditTransaction, "created_at")
