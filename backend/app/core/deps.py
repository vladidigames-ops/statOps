from collections.abc import AsyncGenerator
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.security import decode_token
from app.db.models import User, UserRole
from app.db.session import AsyncSessionLocal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login", auto_error=True)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: DbSession,
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise credentials_exc from exc

    if payload.get("type") != "access":
        raise credentials_exc

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise credentials_exc

    try:
        user_id = UUID(user_id_str)
    except ValueError as exc:
        raise credentials_exc from exc

    user = (
        await db.execute(select(User).where(User.id == user_id, User.is_active.is_(True)))
    ).scalar_one_or_none()

    if user is None:
        raise credentials_exc

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: UserRole):
    allowed = set(roles)

    def _checker(user: CurrentUser) -> User:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action requires one of roles: {sorted(r.value for r in allowed)}",
            )
        return user

    return _checker
