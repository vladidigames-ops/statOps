import enum
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampedMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.db.models.establishment import Establishment


class SourceType(str, enum.Enum):
    iiko_cloud = "iiko_cloud"
    quick_resto = "quick_resto"
    bank_tinkoff = "bank_tinkoff"
    bank_sber = "bank_sber"
    moysklad = "moysklad"
    onec = "onec"


class SourceStatus(str, enum.Enum):
    disabled = "disabled"
    pending = "pending"
    ok = "ok"
    error = "error"


class Source(UUIDPrimaryKeyMixin, TimestampedMixin, Base):
    __tablename__ = "sources"

    establishment_id: Mapped[UUID] = mapped_column(
        ForeignKey("establishments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[SourceType] = mapped_column(
        SQLEnum(SourceType, name="source_type", native_enum=False, length=32),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[SourceStatus] = mapped_column(
        SQLEnum(SourceStatus, name="source_status", native_enum=False, length=16),
        nullable=False,
        default=SourceStatus.pending,
    )
    credentials_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)

    establishment: Mapped["Establishment"] = relationship(back_populates="sources")
