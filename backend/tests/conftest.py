import os
import secrets

os.environ.setdefault("ENV", "test")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("JWT_SECRET_KEY", secrets.token_urlsafe(48))

from cryptography.fernet import Fernet  # noqa: E402

os.environ.setdefault("CREDENTIALS_ENCRYPTION_KEY", Fernet.generate_key().decode())

from collections.abc import AsyncGenerator  # noqa: E402

import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine  # noqa: E402

from app.core.deps import get_db  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.models import *  # noqa: F401,F403,E402
from app.main import app  # noqa: E402


@pytest_asyncio.fixture
async def db_engine():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    Session = async_sessionmaker(bind=db_engine, expire_on_commit=False)
    async with Session() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_engine) -> AsyncGenerator[AsyncClient, None]:
    Session = async_sessionmaker(bind=db_engine, expire_on_commit=False)

    async def _override_get_db():
        async with Session() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
