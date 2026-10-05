import os
import time
from typing import AsyncGenerator
from decimal import Decimal
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from app.main import app
from app.db.base import Base
from app.db.config import get_session
from app.account.deps import get_current_user
from app.account.models import User
from app.shipping.models import ShippingAddress
from app.product.models import Product

# Base directory for isolated test database
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "test_sqlite.db")
DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"

test_engine = create_async_engine(DATABASE_URL, echo=False)
async_test_session = async_sessionmaker(bind=test_engine, expire_on_commit=False, class_=AsyncSession)


async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_test_session() as session:
        yield session


# Register dependency override for session
app.dependency_overrides[get_session] = override_get_session


@pytest_asyncio.fixture(scope="function")
async def setup_database():
    """
    Creates fresh database schema before each test and cleans up afterwards.
    Includes Windows file-lock retry loop for safe SQLite deletion.
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()

    if os.path.exists(DB_PATH):
        for _ in range(5):
            try:
                os.remove(DB_PATH)
                break
            except PermissionError:
                time.sleep(0.3)


@pytest_asyncio.fixture(scope="function")
async def test_session(setup_database) -> AsyncGenerator[AsyncSession, None]:
    """Yields an active AsyncSession attached to the isolated test database."""
    async with async_test_session() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def mock_user(test_session: AsyncSession) -> User:
    """Creates and returns a test buyer user."""
    user = User(
        id=1,
        email="buyer@test.com",
        hashed_password="mock_hashed_password",
        is_active=True,
        is_admin=False,
        is_verified=True
    )
    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)
    return user



@pytest_asyncio.fixture(scope="function")
async def mock_shipping_address(test_session: AsyncSession, mock_user: User) -> ShippingAddress:
    """Creates a default shipping address for the test user."""
    addr = ShippingAddress(
        user_id=mock_user.id,
        name="Test Buyer",
        phone_number="1234567890",
        address_line1="123 Testing Ave",
        city="Testville",
        state="CA",
        pin_code="90210",
        country="USA",
        is_default=True
    )
    test_session.add(addr)
    await test_session.commit()
    await test_session.refresh(addr)
    return addr


@pytest_asyncio.fixture(scope="function")
async def mock_product(test_session: AsyncSession) -> Product:
    """Creates a sample catalog product for testing checkout and stock."""
    prod = Product(
        title="Test Wireless Headphones",
        slug="test-wireless-headphones",
        description="Premium test headphones",
        price=Decimal("99.99"),
        stock_quantity=20
    )
    test_session.add(prod)
    await test_session.commit()
    await test_session.refresh(prod)
    return prod


@pytest_asyncio.fixture(scope="function")
async def test_client(mock_user: User) -> AsyncGenerator[AsyncClient, None]:
    """
    Yields an AsyncClient with authenticated user dependency overrides.
    """
    async def override_current_user():
        return mock_user

    app.dependency_overrides[get_current_user] = override_current_user
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
    app.dependency_overrides.pop(get_current_user, None)
