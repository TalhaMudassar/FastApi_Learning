from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Boolean, ForeignKey, DateTime, Enum, String, Numeric
from app.db.base import Base

if TYPE_CHECKING:
    from app.order.models import Order
    from app.account.models import User

class PaymentStatusEnum(str, PyEnum):
    pending = "pending"
    success = "success"
    failed = "failed"
    cancelled = "cancelled"
    refunded = "refunded"

class PaymentGatewayEnum(str, PyEnum):
    mock = "mock"
    stripe = "stripe"

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="usd", nullable=False)
    status: Mapped[PaymentStatusEnum] = mapped_column(
        Enum(PaymentStatusEnum), 
        default=PaymentStatusEnum.pending, 
        nullable=False
    )
    payment_gateway: Mapped[PaymentGatewayEnum] = mapped_column(
        Enum(PaymentGatewayEnum), 
        default=PaymentGatewayEnum.mock, 
        nullable=False
    )
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False)

    # Provider identifiers & metadata
    pg_order_id: Mapped[str | None] = mapped_column(String(100), nullable=True)     # For Stripe: PaymentIntent ID (pi_...)
    pg_payment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)   # For Stripe: Charge ID (ch_...)
    pg_signature: Mapped[str | None] = mapped_column(String(255), nullable=True)
    client_secret: Mapped[str | None] = mapped_column(String(255), nullable=True)  # For Stripe: client_secret
    error_message: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Failure reason if declined

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    order: Mapped["Order"] = relationship("Order", back_populates="payment")
    user: Mapped["User"] = relationship("User", back_populates="payments")

class ProcessedStripeEvent(Base):
    """
    Stores processed Stripe webhook event IDs with a unique constraint.
    Ensures idempotent webhook handling so events are never processed twice.
    """
    __tablename__ = "processed_stripe_events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    processed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )