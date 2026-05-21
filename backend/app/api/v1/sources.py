import json
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.deps import CurrentUser, DbSession
from app.core.security import encrypt_credentials
from app.db.models import Establishment, Source
from app.schemas.source import SourceCreate, SourceRead, SourceUpdate

router = APIRouter()


@router.get("", response_model=list[SourceRead])
async def list_sources(
    user: CurrentUser,
    db: DbSession,
    establishment_id: UUID | None = None,
) -> list[Source]:
    stmt = (
        select(Source)
        .join(Establishment, Source.establishment_id == Establishment.id)
        .where(Establishment.account_id == user.account_id)
        .order_by(Source.created_at.desc())
    )
    if establishment_id:
        stmt = stmt.where(Source.establishment_id == establishment_id)

    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.post("", response_model=SourceRead, status_code=status.HTTP_201_CREATED)
async def create_source(
    payload: SourceCreate, user: CurrentUser, db: DbSession
) -> Source:
    await _ensure_establishment_belongs_to_user(db, payload.establishment_id, user.account_id)

    source = Source(
        establishment_id=payload.establishment_id,
        type=payload.type,
        name=payload.name,
        credentials_encrypted=encrypt_credentials(json.dumps(payload.credentials)),
    )
    db.add(source)
    await db.flush()
    await db.refresh(source)
    return source


@router.get("/{source_id}", response_model=SourceRead)
async def get_source(source_id: UUID, user: CurrentUser, db: DbSession) -> Source:
    return await _get_owned_source_or_404(db, source_id, user.account_id)


@router.patch("/{source_id}", response_model=SourceRead)
async def update_source(
    source_id: UUID, payload: SourceUpdate, user: CurrentUser, db: DbSession
) -> Source:
    source = await _get_owned_source_or_404(db, source_id, user.account_id)

    updates = payload.model_dump(exclude_unset=True)
    if "credentials" in updates and updates["credentials"] is not None:
        source.credentials_encrypted = encrypt_credentials(json.dumps(updates.pop("credentials")))
    for field, value in updates.items():
        setattr(source, field, value)

    await db.flush()
    await db.refresh(source)
    return source


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source(source_id: UUID, user: CurrentUser, db: DbSession) -> None:
    source = await _get_owned_source_or_404(db, source_id, user.account_id)
    await db.delete(source)


async def _ensure_establishment_belongs_to_user(
    db: AsyncSession, establishment_id: UUID, account_id: UUID
) -> None:
    result = await db.execute(
        select(Establishment.id).where(
            Establishment.id == establishment_id,
            Establishment.account_id == account_id,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establishment not found",
        )


async def _get_owned_source_or_404(
    db: AsyncSession, source_id: UUID, account_id: UUID
) -> Source:
    result = await db.execute(
        select(Source)
        .join(Establishment, Source.establishment_id == Establishment.id)
        .where(
            Source.id == source_id,
            Establishment.account_id == account_id,
        )
    )
    source = result.scalar_one_or_none()
    if source is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source
