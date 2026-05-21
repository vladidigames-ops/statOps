from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.future import select

from app.core.deps import CurrentUser, DbSession
from app.db.models import Establishment
from app.schemas.establishment import (
    EstablishmentCreate,
    EstablishmentRead,
    EstablishmentUpdate,
)

router = APIRouter()


@router.get("", response_model=list[EstablishmentRead])
async def list_establishments(user: CurrentUser, db: DbSession) -> list[Establishment]:
    result = await db.execute(
        select(Establishment)
        .where(Establishment.account_id == user.account_id)
        .order_by(Establishment.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=EstablishmentRead, status_code=status.HTTP_201_CREATED)
async def create_establishment(
    payload: EstablishmentCreate, user: CurrentUser, db: DbSession
) -> Establishment:
    establishment = Establishment(account_id=user.account_id, **payload.model_dump())
    db.add(establishment)
    await db.flush()
    await db.refresh(establishment)
    return establishment


@router.get("/{establishment_id}", response_model=EstablishmentRead)
async def get_establishment(
    establishment_id: UUID, user: CurrentUser, db: DbSession
) -> Establishment:
    establishment = await _get_owned_or_404(db, establishment_id, user.account_id)
    return establishment


@router.patch("/{establishment_id}", response_model=EstablishmentRead)
async def update_establishment(
    establishment_id: UUID,
    payload: EstablishmentUpdate,
    user: CurrentUser,
    db: DbSession,
) -> Establishment:
    establishment = await _get_owned_or_404(db, establishment_id, user.account_id)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(establishment, field, value)
    await db.flush()
    await db.refresh(establishment)
    return establishment


@router.delete("/{establishment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_establishment(
    establishment_id: UUID, user: CurrentUser, db: DbSession
) -> None:
    establishment = await _get_owned_or_404(db, establishment_id, user.account_id)
    await db.delete(establishment)


async def _get_owned_or_404(db, establishment_id: UUID, account_id: UUID) -> Establishment:
    result = await db.execute(
        select(Establishment).where(
            Establishment.id == establishment_id,
            Establishment.account_id == account_id,
        )
    )
    establishment = result.scalar_one_or_none()
    if establishment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Establishment not found"
        )
    return establishment
