from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
from app.db.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from app.cart.models import CartItem
  from app.shipping.models import ShippingAddress
  from app.payment.models import Payment

class User(Base):
  __tablename__ = "users"

  id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
  email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
  hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
  is_active: Mapped[bool] = mapped_column(Boolean, default=True)
  is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
  is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
  updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),onupdate=lambda: datetime.now(timezone.utc))

  refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
  cart_items: Mapped[list["CartItem"]] = relationship(
        "CartItem", back_populates="user", cascade="all, delete-orphan"
    )
  shipping_addresses: Mapped[list["ShippingAddress"]] = relationship(
        "ShippingAddress", back_populates="user", cascade="all, delete-orphan"
    )
  payments: Mapped[list["Payment"]] = relationship(
        "Payment", back_populates="user", cascade="all, delete-orphan"
    )

class RefreshToken(Base):
  __tablename__ = "refresh_tokens"

  id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
  user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
  token: Mapped[str] = mapped_column(String(255), nullable=False)
  expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
  revoked: Mapped[bool] = mapped_column(Boolean, default=False)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

  user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")
