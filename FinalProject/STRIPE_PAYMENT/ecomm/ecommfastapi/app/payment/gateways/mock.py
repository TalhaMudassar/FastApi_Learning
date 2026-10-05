from decimal import Decimal
from typing import Any
from app.payment.gateways.base import BasePaymentGateway, GatewayPaymentResult
from app.payment.models import PaymentStatusEnum
from app.payment.utils import generate_mock_ids

class MockPaymentGateway(BasePaymentGateway):
    """
    Mock payment gateway implementation.
    Simulates immediate payment authorization and settlement in memory.
    """

    async def create_payment(
        self,
        amount: Decimal | float,
        order_id: int,
        user_id: int,
        currency: str = "usd",
        metadata: dict[str, Any] | None = None,
        simulate_success: bool = True
    ) -> GatewayPaymentResult:
        is_success = bool(simulate_success)
        payment_status = PaymentStatusEnum.success if is_success else PaymentStatusEnum.failed
        pg_order_id, pg_payment_id, pg_signature = generate_mock_ids()

        return GatewayPaymentResult(
            status=payment_status,
            is_paid=is_success,
            pg_order_id=pg_order_id,
            pg_payment_id=pg_payment_id,
            pg_signature=pg_signature,
            client_secret=f"mock_secret_{pg_order_id}",
            raw_response={
                "gateway": "mock",
                "order_id": order_id,
                "user_id": user_id,
                "amount": float(amount),
                "currency": currency,
                "simulate_success": is_success
            }
        )

    async def refund_payment(
        self,
        payment_id: str,
        amount: Decimal | float | None = None,
        currency: str = "usd",
        reason: str = "requested_by_customer",
        metadata: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        import uuid
        return {
            "status": "succeeded",
            "refund_id": f"ref_mock_{uuid.uuid4().hex[:12]}",
            "amount": float(amount) if amount else 0.0,
            "currency": currency,
            "gateway": "mock"
        }

