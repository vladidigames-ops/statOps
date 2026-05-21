from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

_is_sqlite = settings.database_url.startswith("sqlite")

engine = create_async_engine(
    str(settings.database_url),
    echo=settings.debug and settings.env == "dev",
    pool_pre_ping=not _is_sqlite,
    **({} if _is_sqlite else {"pool_size": 10, "max_overflow": 20}),
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
