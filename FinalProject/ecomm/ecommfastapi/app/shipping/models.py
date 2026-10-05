from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, String, Boolean, ForeignKey, Enum
from app.db.base import Base

if TYPE_CHECKING:
    from app.account.models import User
    from app.order.models import Order

class ShippingStatusEnum(str, PyEnum):
    pending = "pending"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class ShippingAddress(Base):
    __tablename__ = "shipping_addresses"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    address_line1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pin_code: Mapped[str] = mapped_column(String(20), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship("User", back_populates="shipping_addresses")
    # Added reverse relationship for Order
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="shipping_address")

class ShippingStatus(Base):
    __tablename__ = "shipping_status"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True)
    status: Mapped[ShippingStatusEnum] = mapped_column(
        Enum(ShippingStatusEnum), 
        default=ShippingStatusEnum.pending
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Added reverse relationship for Order
    order: Mapped["Order"] = relationship("Order", back_populates="shipping_status")