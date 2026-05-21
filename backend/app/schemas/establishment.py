from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.db.models.establishment import EstablishmentType


class EstablishmentBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: EstablishmentType = EstablishmentType.restaurant
    timezone: str = Field(default="Europe/Moscow", max_length=64)
    currency: str = Field(default="RUB", min_length=3, max_length=8)


class EstablishmentCreate(EstablishmentBase):
    pass


class EstablishmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    type: EstablishmentType | None = None
    timezone: str | None = Field(default=None, max_length=64)
    currency: str | None = Field(default=None, min_length=3, max_length=8)


class EstablishmentRead(EstablishmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    account_id: UUID
    created_at: datetime
    updated_at: datetime
