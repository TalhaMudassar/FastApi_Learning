import asyncio
import json
import time
import hmac
import hashlib
import sys
from pathlib import Path
from decimal import Decimal

# Ensure project root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from sqlalchemy import select

from app.main import app
from app.db.config import async_session
from app.payment.config import configure_stripe
from app.payment.models import Payment, PaymentGatewayEnum, PaymentStatusEnum, ProcessedStripeEvent
from app.order.models import Order, OrderStatusEnum
from app.shipping.models import ShippingAddress, ShippingStatus, ShippingStatusEnum
from app.account.models import User

def make_stripe_signature(payload: str, secret: str) -> tuple[str, int]:
    ts = int(time.time())
    signed = f"{ts}.{payload}".encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), signed, hashlib.sha256).hexdigest()
    return f"t={ts},v1={sig}", ts

async def run_tests():
    settings = configure_stripe()
    secret = settings.STRIPE_WEBHOOK_SECRET
    print(f"Testing with Stripe Webhook Secret: {secret[:15]}...")

    async with async_session() as session:
        # Get existing user
        user = (await session.scalars(select(User))).first()
        assert user is not None, "A user must exist in the database"
        
        # Get or create shipping address
        addr = (await session.scalars(select(ShippingAddress).where(ShippingAddress.user_id == user.id))).first()
        if not addr:
            addr = ShippingAddress(
                user_id=user.id,
                name="Test Buyer",
                phone_number="1234567890",
                address_line1="123 Test St",
                city="Test City",
                state="Test State",
                pin_code="12345",
                country="Testland"
            )
            session.add(addr)
            await session.commit()
            await session.refresh(addr)

        # Create a pending test order for Stripe checkout
        test_order = Order(
            user_id=user.id,
            total_price=Decimal("150.00"),
            status=OrderStatusEnum.pending,
            shipping_address_id=addr.id
        )
        session.add(test_order)
        await session.commit()
        await session.refresh(test_order)

        # Create a matching pending Stripe payment record
        mock_pi_id = f"pi_test_step7_{int(time.time())}"
        test_payment = Payment(
            order_id=test_order.id,
            user_id=user.id,
            amount=150.00,
            currency="usd",
            status=PaymentStatusEnum.pending,
            payment_gateway=PaymentGatewayEnum.stripe,
            is_paid=False,
            pg_order_id=mock_pi_id,
            client_secret=f"{mock_pi_id}_secret_xyz"
        )
        session.add(test_payment)
        await session.commit()
        await session.refresh(test_payment)

        order_id = test_order.id
        payment_id = test_payment.id
        print(f"Setup complete: Created test Order ID={order_id}, Payment ID={payment_id}, PI={mock_pi_id}")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Test Case 1: Missing Stripe-Signature header -> Expected 400
        print("\n--- Test 1: Missing Stripe-Signature header ---")
        res1 = await client.post("/api/payments/webhook", content=b"{}")
        print("Status code:", res1.status_code, "Detail:", res1.json())
        assert res1.status_code == 400
        assert "Missing Stripe-Signature header" in res1.json()["detail"]

        # Test Case 2: Invalid signature -> Expected 400
        print("\n--- Test 2: Invalid/tampered Stripe-Signature ---")
        res2 = await client.post(
            "/api/payments/webhook",
            content=b"{}",
            headers={"Stripe-Signature": "t=12345,v1=tampered_invalid_hex_string"}
        )
        print("Status code:", res2.status_code, "Detail:", res2.json())
        assert res2.status_code == 400
        assert "Invalid webhook signature" in res2.json()["detail"]

        # Test Case 3: Valid payment_intent.succeeded webhook -> Expected 200 OK & DB update
        print("\n--- Test 3: Valid payment_intent.succeeded ---")
        evt3_id = f"evt_step7_succ_{int(time.time())}"
        payload3 = json.dumps({
            "id": evt3_id,
            "object": "event",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": mock_pi_id,
                    "object": "payment_intent",
                    "amount": 15000,
                    "currency": "usd",
                    "status": "succeeded",
                    "latest_charge": f"ch_mock_charge_{int(time.time())}",
                    "metadata": {
                        "order_id": str(order_id)
                    }
                }
            }
        })
        sig3, _ = make_stripe_signature(payload3, secret)
        res3 = await client.post(
            "/api/payments/webhook",
            content=payload3.encode("utf-8"),
            headers={"Content-Type": "application/json", "Stripe-Signature": sig3}
        )
        print("Status code:", res3.status_code, "Response:", res3.json())
        assert res3.status_code == 200
        assert res3.json()["status"] == "success"

        # Verify DB updates after success
        async with async_session() as session:
            db_payment = await session.get(Payment, payment_id)
            assert db_payment.is_paid == True
            assert db_payment.status == PaymentStatusEnum.success
            assert db_payment.pg_payment_id.startswith("ch_mock_charge_")
            print(f"Verified Payment: is_paid={db_payment.is_paid}, status={db_payment.status.value}, charge={db_payment.pg_payment_id}")

            db_order = await session.get(Order, order_id)
            assert db_order.status == OrderStatusEnum.confirmed
            print(f"Verified Order: status={db_order.status.value}")

            # Verify shipping status created
            ship_stmt = select(ShippingStatus).where(ShippingStatus.order_id == order_id)
            ship = (await session.scalars(ship_stmt)).first()
            assert ship is not None
            assert ship.status == ShippingStatusEnum.pending
            print(f"Verified ShippingStatus: id={ship.id}, status={ship.status.value}")

            # Verify ProcessedStripeEvent entry
            proc_stmt = select(ProcessedStripeEvent).where(ProcessedStripeEvent.event_id == evt3_id)
            proc_evt = (await session.scalars(proc_stmt)).first()
            assert proc_evt is not None
            print(f"Verified ProcessedStripeEvent: event_id={proc_evt.event_id}")

        # Test Case 4: Idempotent replay of the exact same event -> Expected 200 OK without re-execution
        print("\n--- Test 4: Replaying same event (Idempotency) ---")
        res4 = await client.post(
            "/api/payments/webhook",
            content=payload3.encode("utf-8"),
            headers={"Content-Type": "application/json", "Stripe-Signature": sig3}
        )
        print("Status code:", res4.status_code, "Response:", res4.json())
        assert res4.status_code == 200
        assert "already processed" in res4.json()["message"]

        # Test Case 5: payment_intent.payment_failed -> Expected 200 OK & order cancellation
        print("\n--- Test 5: payment_intent.payment_failed ---")
        # Create a second test order to fail
        async with async_session() as session:
            fail_order = Order(
                user_id=user.id,
                total_price=Decimal("99.00"),
                status=OrderStatusEnum.pending,
                shipping_address_id=addr.id
            )
            session.add(fail_order)
            await session.commit()
            await session.refresh(fail_order)

            fail_pi_id = f"pi_test_fail_{int(time.time())}"
            fail_payment = Payment(
                order_id=fail_order.id,
                user_id=user.id,
                amount=99.00,
                currency="usd",
                status=PaymentStatusEnum.pending,
                payment_gateway=PaymentGatewayEnum.stripe,
                is_paid=False,
                pg_order_id=fail_pi_id
            )
            session.add(fail_payment)
            await session.commit()
            await session.refresh(fail_payment)
            fail_order_id = fail_order.id
            fail_payment_id = fail_payment.id

        evt5_id = f"evt_step7_fail_{int(time.time())}"
        payload5 = json.dumps({
            "id": evt5_id,
            "object": "event",
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": fail_pi_id,
                    "object": "payment_intent",
                    "amount": 9900,
                    "currency": "usd",
                    "status": "requires_payment_method",
                    "last_payment_error": {
                        "code": "card_declined",
                        "message": "Your card has insufficient funds."
                    },
                    "metadata": {
                        "order_id": str(fail_order_id)
                    }
                }
            }
        })
        sig5, _ = make_stripe_signature(payload5, secret)
        res5 = await client.post(
            "/api/payments/webhook",
            content=payload5.encode("utf-8"),
            headers={"Content-Type": "application/json", "Stripe-Signature": sig5}
        )
        print("Status code:", res5.status_code, "Response:", res5.json())
        assert res5.status_code == 200

        async with async_session() as session:
            db_fail_payment = await session.get(Payment, fail_payment_id)
            assert db_fail_payment.is_paid == False
            assert db_fail_payment.status == PaymentStatusEnum.failed
            assert "insufficient funds" in db_fail_payment.error_message
            print(f"Verified Failed Payment: status={db_fail_payment.status.value}, error={db_fail_payment.error_message}")

            db_fail_order = await session.get(Order, fail_order_id)
            assert db_fail_order.status == OrderStatusEnum.cancelled
            print(f"Verified Failed Order: status={db_fail_order.status.value}")

    print("\nALL STEP 7 WEBHOOK TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
