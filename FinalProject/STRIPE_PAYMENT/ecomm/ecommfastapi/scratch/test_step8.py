import asyncio
import json
import time
import hmac
import hashlib
import sys
from pathlib import Path
from decimal import Decimal

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from sqlalchemy import select, func

from app.main import app
from app.db.config import async_session
from app.payment.config import configure_stripe
from app.payment.models import Payment, PaymentGatewayEnum, PaymentStatusEnum, ProcessedStripeEvent
from app.order.models import Order, OrderStatusEnum
from app.shipping.models import ShippingAddress
from app.account.models import User

def make_stripe_signature(payload: str, secret: str) -> str:
    ts = int(time.time())
    signed = f"{ts}.{payload}".encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), signed, hashlib.sha256).hexdigest()
    return f"t={ts},v1={sig}"

async def run_step8_tests():
    settings = configure_stripe()
    secret = settings.STRIPE_WEBHOOK_SECRET

    async with async_session() as session:
        user = (await session.scalars(select(User))).first()
        assert user is not None

        addr = (await session.scalars(select(ShippingAddress).where(ShippingAddress.user_id == user.id))).first()

        # Create test order & payment for concurrent test
        order = Order(
            user_id=user.id,
            total_price=Decimal("120.00"),
            status=OrderStatusEnum.pending,
            shipping_address_id=addr.id
        )
        session.add(order)
        await session.commit()
        await session.refresh(order)

        pi_id = f"pi_concurrent_{int(time.time())}"
        payment = Payment(
            order_id=order.id,
            user_id=user.id,
            amount=120.00,
            currency="usd",
            status=PaymentStatusEnum.pending,
            payment_gateway=PaymentGatewayEnum.stripe,
            is_paid=False,
            pg_order_id=pi_id
        )
        session.add(payment)
        await session.commit()
        await session.refresh(payment)

        order_id = order.id
        payment_id = payment.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # -------------------------------------------------------------
        # Test 1: High-concurrency duplicate webhook delivery
        # -------------------------------------------------------------
        print("\n--- Test 1: Simulating 5 Concurrent Duplicate Webhooks (Same Event ID) ---")
        same_event_id = f"evt_race_{int(time.time())}"
        payload_dict = {
            "id": same_event_id,
            "object": "event",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": pi_id,
                    "object": "payment_intent",
                    "amount": 12000,
                    "currency": "usd",
                    "status": "succeeded",
                    "latest_charge": f"ch_race_{int(time.time())}",
                    "metadata": {"order_id": str(order_id)}
                }
            }
        }
        payload_str = json.dumps(payload_dict)
        sig = make_stripe_signature(payload_str, secret)
        headers = {"Content-Type": "application/json", "Stripe-Signature": sig}

        async def post_event():
            return await client.post("/api/payments/webhook", content=payload_str.encode("utf-8"), headers=headers)

        # Fire 5 concurrent requests with the exact same event ID
        responses = await asyncio.gather(*(post_event() for _ in range(5)))
        for i, res in enumerate(responses):
            print(f"Request {i+1} status: {res.status_code}, response: {res.json()}")
            assert res.status_code == 200, f"Request {i+1} failed with {res.status_code}"

        # Verify only 1 row inserted in processed_stripe_events
        async with async_session() as session:
            count_stmt = select(func.count(ProcessedStripeEvent.id)).where(ProcessedStripeEvent.event_id == same_event_id)
            count = (await session.scalar(count_stmt))
            print(f"ProcessedStripeEvent row count for {same_event_id}: {count}")
            assert count == 1, f"Expected exactly 1 row, got {count}"

            # Verify order is confirmed and payment is paid
            updated_payment = await session.get(Payment, payment_id)
            assert updated_payment.is_paid == True
            assert updated_payment.status == PaymentStatusEnum.success
            updated_order = await session.get(Order, order_id)
            assert updated_order.status == OrderStatusEnum.confirmed
            print("Verified Order & Payment transitioned successfully without race errors!")

        # -------------------------------------------------------------
        # Test 2: State Guard - Out-of-order/stale failure after payment success
        # -------------------------------------------------------------
        print("\n--- Test 2: State Guard - Stale Failure Webhook After Success ---")
        stale_event_id = f"evt_stale_fail_{int(time.time())}"
        stale_payload = json.dumps({
            "id": stale_event_id,
            "object": "event",
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": pi_id,
                    "object": "payment_intent",
                    "amount": 12000,
                    "currency": "usd",
                    "status": "requires_payment_method",
                    "last_payment_error": {"message": "Card declined"},
                    "metadata": {"order_id": str(order_id)}
                }
            }
        })
        stale_sig = make_stripe_signature(stale_payload, secret)
        stale_res = await client.post(
            "/api/payments/webhook",
            content=stale_payload.encode("utf-8"),
            headers={"Content-Type": "application/json", "Stripe-Signature": stale_sig}
        )
        print("Status code:", stale_res.status_code, "Response:", stale_res.json())
        assert stale_res.status_code == 200

        # Verify the order and payment are STILL confirmed & paid!
        async with async_session() as session:
            check_payment = await session.get(Payment, payment_id)
            assert check_payment.is_paid == True
            assert check_payment.status == PaymentStatusEnum.success
            check_order = await session.get(Order, order_id)
            assert check_order.status == OrderStatusEnum.confirmed
            print("Verified State Guard: Confirmed/Paid order was NOT cancelled by stale failure webhook!")

    print("\nALL STEP 8 IDEMPOTENCY & DUPLICATE WEBHOOK TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(run_step8_tests())
