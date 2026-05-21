import enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampedMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.db.models.account import Account
    from app.db.models.source import Source


class EstablishmentType(str, enum.Enum):
    restaurant = "restaurant"
    cafe = "cafe"
    bar = "bar"
    coffeeshop = "coffeeshop"
    bakery = "bakery"
    fastfood = "fastfood"
    other = "other"


class Establishment(UUIDPrimaryKeyMixin, TimestampedMixin, Base):
    __tablename__ = "establishments"

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[EstablishmentType] = mapped_column(
        SQLEnum(EstablishmentType, name="establishment_type", native_enum=False, length=32),
        default=EstablishmentType.restaurant,
        nullable=False,
    )
    timezone: Mapped[str] = mapped_column(String(64), default="Europe/Moscow", nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="RUB", nullable=False)

    account: Mapped["Account"] = relationship(back_populates="establishments")
    sources: Mapped[list["Source"]] = relationship(
        back_populates="establishment", cascade="all, delete-orphan"
    )
