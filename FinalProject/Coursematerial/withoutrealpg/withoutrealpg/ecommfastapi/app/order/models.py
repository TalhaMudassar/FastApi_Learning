from datetime import datetime, timezone
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, DateTime, Enum
from app.db.base import Base
from typing import TYPE_CHECKING, Optional
from app.product.models import Product
import enum

if TYPE_CHECKING:
  from app.payment.models import Payment
  from app.shipping.models import ShippingAddress, ShippingStatus

class OrderStatusEnum(str, enum.Enum):
  pending = "pending"
  confirmed = "confirmed"
  cancelled = "cancelled"

class Order(Base):
  __tablename__ = "orders"

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  total_price: Mapped[float] = mapped_column(nullable=False)
  status: Mapped[OrderStatusEnum] = mapped_column(Enum(OrderStatusEnum), default=OrderStatusEnum.pending, nullable=False)
  shipping_address_id: Mapped[int] = mapped_column(ForeignKey("shipping_addresses.id"), nullable=False)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

  orderitems: Mapped[list["OrderItem"]] = relationship(
          back_populates="order", cascade="all, delete-orphan"
      )
  shipping_address: Mapped["ShippingAddress"] = relationship("ShippingAddress", back_populates="orders", lazy="selectin")

  shipping_status: Mapped["ShippingStatus"] = relationship("ShippingStatus", back_populates="order", uselist=False, cascade="all, delete-orphan", lazy="selectin")

  payment: Mapped[Optional["Payment"]] = relationship(
        back_populates="order", uselist=False, cascade="all, delete-orphan"
    )

class OrderItem(Base):
  __tablename__ = "order_items"

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
  product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
  quantity: Mapped[int] = mapped_column(nullable=False)
  price: Mapped[float] = mapped_column(nullable=False)

  order: Mapped["Order"] = relationship("Order", back_populates="orderitems")
  product: Mapped[Optional["Product"]] = relationship("Product", lazy="selectin")





