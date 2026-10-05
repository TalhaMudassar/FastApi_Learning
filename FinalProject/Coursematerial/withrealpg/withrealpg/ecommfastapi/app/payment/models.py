from datetime import datetime, timezone
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Boolean, ForeignKey, DateTime, Enum, String
from app.db.base import Base
from typing import TYPE_CHECKING
from enum import Enum as PyEnum

if TYPE_CHECKING:
  from app.order.models import Order
  from app.account.models import User

class PaymentStatusEnum(str, PyEnum):
  pending = "pending"
  success = "success"
  failed = "failed"
  cancelled = "cancelled"

class PaymentGatewayEnum(str, PyEnum):
  mock = "mock"
  razorpay = "razorpay"

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[PaymentStatusEnum] = mapped_column(Enum(PaymentStatusEnum), default=PaymentStatusEnum.pending, nullable=False)
    payment_gateway: Mapped[PaymentGatewayEnum] = mapped_column(Enum(PaymentGatewayEnum), default=PaymentGatewayEnum.mock, nullable=False)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False)

    pg_order_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pg_payment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pg_signature: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),onupdate=lambda: datetime.now(timezone.utc))

    order: Mapped["Order"] = relationship("Order", back_populates="payment")
    user: Mapped["User"] = relationship("User", back_populates="payments")
    

    

