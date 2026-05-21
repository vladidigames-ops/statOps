from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.db.models.source import SourceStatus, SourceType


class SourceBase(BaseModel):
    type: SourceType
    name: str = Field(min_length=1, max_length=255)


class SourceCreate(SourceBase):
    establishment_id: UUID
    credentials: dict[str, Any] = Field(
        description="Source-specific credentials payload. Will be encrypted at rest."
    )


class SourceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    credentials: dict[str, Any] | None = None


class SourceRead(SourceBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    establishment_id: UUID
    status: SourceStatus
    last_sync_at: datetime | None
    last_error: str | None
    created_at: datetime
    updated_at: datetime
