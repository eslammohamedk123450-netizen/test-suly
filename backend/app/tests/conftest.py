"""Configuration and fixtures for SULY AI tests."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.core.config import settings
from backend.app.db.base import Base


# Create database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_suly_ai.db"


engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, echo=False
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def clean_db():
    """Clean database before each test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def get_db() -> Session:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def db_session():
    """Provide a database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture
def override_get_db():
    """Override get_db dependency for testing."""
    def _override():
        db = SessionLocal()
        yield db
        db.close()
    return _override


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    from backend.app.db.models.user import User
    from backend.app.auth.service import AuthService, hash_password
    
    # Check if user already exists
    existing = db_session.query(User).filter(User.email == "test@example.com").first()
    if existing:
        yield existing
        return
    
    user = User(
        email="test@example.com",
        full_name="Test User",
        is_active=True,
        is_admin=False,
        credit_balance=100,
        hashed_password=hash_password("password123")[0],
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    yield user


@pytest.fixture
def test_admin_user(db_session):
    """Create a test admin user."""
    from backend.app.db.models.user import User
    from backend.app.auth.service import AuthService, hash_password
    
    existing = db_session.query(User).filter(User.email == "admin@example.com").first()
    if existing:
        yield existing
        return
    
    user = User(
        email="admin@example.com",
        full_name="Admin User",
        is_active=True,
        is_admin=True,
        credit_balance=500,
        hashed_password=hash_password("password123")[0],
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    yield user


@pytest.fixture
def test_plan(db_session):
    """Create a test subscription plan."""
    from backend.app.db.models.admin import SubscriptionPlan
    
    existing = db_session.query(SubscriptionPlan).filter(SubscriptionPlan.name == "test_plan").first()
    if existing:
        yield existing
        return
    
    plan = SubscriptionPlan(
        name="test_plan",
        description="Test plan for unit testing",
        price=0.0,
        billing_period="monthly",
        monthly_credits=100,
        daily_credits=10,
        max_requests=50,
        is_active=True,
    )
    db_session.add(plan)
    db_session.commit()
    db_session.refresh(plan)
    yield plan


@pytest.fixture
def test_model(db_session, test_plan):
    """Create a test AI model."""
    from backend.app.db.models.admin import AIModel, AIProvider
    
    # Ensure provider exists
    provider = db_session.query(AIProvider).filter(AIProvider.name == "test_provider").first()
    if not provider:
        provider = AIProvider(
            name="test_provider",
            provider_type="openai_compatible",
            base_url="https://api.example.com/v1",
            enabled=True,
            priority=100,
            timeout_seconds=30,
        )
        db_session.add(provider)
        db_session.commit()
        db_session.refresh(provider)
    
    existing = db_session.query(AIModel).filter(AIModel.name == "test_model").first()
    if existing:
        yield existing
        return
    
    model = AIModel(
        name="test_model",
        provider_id=provider.id,
        model_identifier="test-model-id",
        description="Test model for unit testing",
        input_price=0.01,
        output_price=0.02,
        context_window=100000,
        enabled=True,
        priority=100,
        fallback_eligible=True,
    )
    db_session.add(model)
    db_session.commit()
    db_session.refresh(model)
    yield model


@pytest.fixture
def test_user_with_subscription(db_session, test_user, test_plan):
    """Create a test user with subscription."""
    from backend.app.db.models.admin import UserSubscription
    
    subscription = UserSubscription(
        user_id=test_user.id,
        plan_id=test_plan.id,
        is_active=True,
    )
    db_session.add(subscription)
    db_session.commit()
    db_session.refresh(subscription)
    test_user.credit_balance = test_plan.monthly_credits
    yield test_user


def hash_password(password: str) -> tuple[str, str]:
    """Helper to hash password for testing."""
    import hashlib
    import secrets
    
    salt = secrets.token_bytes(16)
    derived = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1).hex()
    salt_hex = salt.hex()
    return f"scrypt$n=16384$r=8$p=1${salt_hex}${derived}", salt_hex
