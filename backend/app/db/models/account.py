from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampedMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.db.models.establishment import Establishment
    from app.db.models.user import User


class Account(UUIDPrimaryKeyMixin, TimestampedMixin, Base):
    __tablename__ = "accounts"

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    users: Mapped[list["User"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
    establishments: Mapped[list["Establishment"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
