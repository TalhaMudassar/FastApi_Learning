from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any
from app.payment.models import PaymentStatusEnum

@dataclass
class GatewayPaymentResult:
    """Standardized result returned by any payment gateway implementation."""
    status: PaymentStatusEnum
    is_paid: bool
    pg_order_id: str | None = None
    pg_payment_id: str | None = None
    pg_signature: str | None = None
    client_secret: str | None = None  # Required by frontend (e.g., Stripe Elements)
    raw_response: dict[str, Any] = field(default_factory=dict)

class BasePaymentGateway(ABC):
    """Abstract base class defining the payment gateway contract."""

    @abstractmethod
    async def create_payment(
        self,
        amount: Decimal | float,
        order_id: int,
        user_id: int,
        currency: str = "usd",
        metadata: dict[str, Any] | None = None,
        simulate_success: bool = True
    ) -> GatewayPaymentResult:
        """
        Create or initiate a payment with the provider.
        """
        pass

    @abstractmethod
    async def refund_payment(
        self,
        payment_id: str,
        amount: Decimal | float | None = None,
        currency: str = "usd",
        reason: str = "requested_by_customer",
        metadata: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        Process a refund for a previously captured payment.
        """
        pass

