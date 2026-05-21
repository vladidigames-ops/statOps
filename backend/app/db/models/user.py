import enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampedMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.db.models.account import Account


class UserRole(str, enum.Enum):
    owner = "owner"
    manager = "manager"
    accountant = "accountant"
    viewer = "viewer"


class User(UUIDPrimaryKeyMixin, TimestampedMixin, Base):
    __tablename__ = "users"

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role", native_enum=False, length=32),
        nullable=False,
        default=UserRole.owner,
    )
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    account: Mapped["Account"] = relationship(back_populates="users")
