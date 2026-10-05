import sys, os
sys.path.insert(0, os.path.abspath("."))
import asyncio
from unittest.mock import patch, MagicMock
from decimal import Decimal
from sqlalchemy import select
from app.db.config import engine, async_session
from app.account.models import User
from app.order.models import Order, OrderStatusEnum
from app.shipping.models import ShippingStatus, ShippingStatusEnum
from app.payment.models import Payment, PaymentStatusEnum, PaymentGatewayEnum
from app.order.services import cancel_order

async def test_order_refund_flow():
    async with async_session() as session:
        # Find or create a test user and address
        user = (await session.scalars(select(User))).first()
        if not user:
            print("No test user found")
            return

        from app.shipping.models import ShippingAddress
        addr = (await session.scalars(select(ShippingAddress).where(ShippingAddress.user_id == user.id))).first()

        # 1. Create a simulated confirmed order with paid Stripe payment
        test_order = Order(
            user_id=user.id,
            total_price=Decimal("49.99"),
            shipping_address_id=addr.id if addr else 1,
            status=OrderStatusEnum.confirmed
        )
        session.add(test_order)
        await session.flush()

        test_shipping = ShippingStatus(
            order_id=test_order.id,
            status=ShippingStatusEnum.pending
        )
        session.add(test_shipping)

        test_payment = Payment(
            order_id=test_order.id,
            user_id=user.id,
            amount=Decimal("49.99"),
            currency="usd",
            status=PaymentStatusEnum.success,
            payment_gateway=PaymentGatewayEnum.stripe,
            is_paid=True,
            pg_order_id="pi_test_refund_12345",
            pg_payment_id="ch_test_refund_12345"
        )
        session.add(test_payment)
        await session.commit()
        order_id = test_order.id
        print(f"Created Test Order #{order_id} with paid Stripe status")

        # 2. Mock stripe.Refund.create
        mock_refund = MagicMock()
        mock_refund.status = "succeeded"
        mock_refund.id = "re_test_98765"
        mock_refund.amount = 4999
        mock_refund.currency = "usd"

        with patch("stripe.Refund.create", return_value=mock_refund) as mock_stripe_refund:
            cancelled_order = await cancel_order(session, user.id, order_id)
            
            # Assertions
            assert cancelled_order.status == OrderStatusEnum.cancelled
            assert cancelled_order.shipping_status.status == ShippingStatusEnum.cancelled
            
            # Check payment record
            stmt = select(Payment).where(Payment.order_id == order_id)
            payment = (await session.scalars(stmt)).first()
            assert payment.status == PaymentStatusEnum.refunded
            assert payment.is_paid == False
            assert "re_test_98765" in payment.error_message
            assert mock_stripe_refund.called
            print("SUCCESS: Stripe refund API called with:", mock_stripe_refund.call_args)
            print(f"Payment record updated: status={payment.status.value}, is_paid={payment.is_paid}, note={payment.error_message}")
            print(f"Order status: {cancelled_order.status.value}")

if __name__ == "__main__":
    asyncio.run(test_order_refund_flow())
