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
from sqlalchemy import select

from app.main import app
from app.db.config import async_session
from app.payment.config import configure_stripe
from app.payment.models import Payment, PaymentGatewayEnum, PaymentStatusEnum
from app.order.models import Order, OrderItem, OrderStatusEnum
from app.shipping.models import ShippingAddress
from app.product.models import Product
from app.account.models import User
from app.order.services import cancel_order

def make_stripe_signature(payload: str, secret: str) -> str:
    ts = int(time.time())
    signed = f"{ts}.{payload}".encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), signed, hashlib.sha256).hexdigest()
    return f"t={ts},v1={sig}"

async def run_step9_tests():
    settings = configure_stripe()
    secret = settings.STRIPE_WEBHOOK_SECRET

    async with async_session() as session:
        user = (await session.scalars(select(User))).first()
        assert user is not None, "User required"

        addr = (await session.scalars(select(ShippingAddress).where(ShippingAddress.user_id == user.id))).first()

        # Create or pick a test product
        prod = (await session.scalars(select(Product))).first()
        if not prod:
            prod = Product(
                title="Test Headphones",
                slug=f"test-headphones-{int(time.time())}",
                price=Decimal("50.00"),
                stock_quantity=100
            )
            session.add(prod)
            await session.commit()
            await session.refresh(prod)

        product_id = prod.id
        initial_stock = prod.stock_quantity
        print(f"Initial Product '{prod.title}' (ID {product_id}) Stock: {initial_stock}")

        # Simulate Checkout reserving 2 units of stock
        prod.stock_quantity -= 2
        order1 = Order(
            user_id=user.id,
            total_price=Decimal("100.00"),
            status=OrderStatusEnum.pending,
            shipping_address_id=addr.id
        )
        session.add(order1)
        await session.flush()

        item1 = OrderItem(
            order_id=order1.id,
            product_id=product_id,
            quantity=2,
            price=Decimal("50.00")
        )
        session.add(item1)

        pi_id1 = f"pi_stock_fail_{int(time.time())}"
        pay1 = Payment(
            order_id=order1.id,
            user_id=user.id,
            amount=100.00,
            currency="usd",
            status=PaymentStatusEnum.pending,
            payment_gateway=PaymentGatewayEnum.stripe,
            is_paid=False,
            pg_order_id=pi_id1
        )
        session.add(pay1)
        await session.commit()

        order1_id = order1.id
        print(f"Order 1 created: ID={order1_id}, Stock decremented to {prod.stock_quantity}")
        assert prod.stock_quantity == initial_stock - 2

    # ------------------------------------------------------------------
    # Test 1: Webhook Payment Failed restores inventory
    # ------------------------------------------------------------------
    print("\n--- Test 1: Stripe Payment Failed Webhook -> Stock Restored ---")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        evt_fail_id = f"evt_stock_fail_{int(time.time())}"
        payload_fail = json.dumps({
            "id": evt_fail_id,
            "object": "event",
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": pi_id1,
                    "object": "payment_intent",
                    "amount": 10000,
                    "currency": "usd",
                    "status": "requires_payment_method",
                    "last_payment_error": {"message": "Card expired"},
                    "metadata": {"order_id": str(order1_id)}
                }
            }
        })
        sig_fail = make_stripe_signature(payload_fail, secret)
        res = await client.post(
            "/api/payments/webhook",
            content=payload_fail.encode("utf-8"),
            headers={"Content-Type": "application/json", "Stripe-Signature": sig_fail}
        )
        print("Webhook response:", res.status_code, res.json())
        assert res.status_code == 200

    async with async_session() as session:
        reloaded_prod = await session.get(Product, product_id)
        reloaded_order = await session.get(Order, order1_id)
        reloaded_pay = (await session.scalars(select(Payment).where(Payment.order_id == order1_id))).first()

        print(f"Post-Failure Stock: {reloaded_prod.stock_quantity}")
        print(f"Post-Failure Order Status: {reloaded_order.status.value}")
        print(f"Post-Failure Payment Status: {reloaded_pay.status.value}")

        assert reloaded_order.status == OrderStatusEnum.cancelled
        assert reloaded_pay.status == PaymentStatusEnum.failed
        assert reloaded_prod.stock_quantity == initial_stock, "Stock must be fully restored!"
        print("Test 1 SUCCESS: Stock was restored to initial quantity!")

    # ------------------------------------------------------------------
    # Test 2: Idempotent Stock Restoration (Duplicate failure must not add stock again)
    # ------------------------------------------------------------------
    print("\n--- Test 2: Duplicate Failure Event -> No Duplicate Stock Inflation ---")
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        evt_dup_id = f"evt_dup_fail_{int(time.time())}"
        payload_dup = json.dumps({
            "id": evt_dup_id,
            "object": "event",
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": pi_id1,
                    "object": "payment_intent",
                    "amount": 10000,
                    "currency": "usd",
                    "status": "requires_payment_method",
                    "last_payment_error": {"message": "Card expired"},
                    "metadata": {"order_id": str(order1_id)}
                }
            }
        })
        sig_dup = make_stripe_signature(payload_dup, secret)
        res_dup = await client.post(
            "/api/payments/webhook",
            content=payload_dup.encode("utf-8"),
            headers={"Content-Type": "application/json", "Stripe-Signature": sig_dup}
        )
        print("Duplicate webhook response:", res_dup.status_code, res_dup.json())
        assert res_dup.status_code == 200

    async with async_session() as session:
        reloaded_prod = await session.get(Product, product_id)
        print(f"Stock after duplicate failure event: {reloaded_prod.stock_quantity}")
        assert reloaded_prod.stock_quantity == initial_stock, "Stock must NOT increase a second time!"
        print("Test 2 SUCCESS: Stock remained strictly preserved (no inflation)!")

    # ------------------------------------------------------------------
    # Test 3: Manual cancel_order service function with centralized stock reconciliation
    # ------------------------------------------------------------------
    print("\n--- Test 3: cancel_order Service Function Stock Restoration ---")
    async with async_session() as session:
        prod = await session.get(Product, product_id)
        prod.stock_quantity -= 3
        order2 = Order(
            user_id=user.id,
            total_price=Decimal("150.00"),
            status=OrderStatusEnum.pending,
            shipping_address_id=addr.id
        )
        session.add(order2)
        await session.flush()

        item2 = OrderItem(
            order_id=order2.id,
            product_id=product_id,
            quantity=3,
            price=Decimal("50.00")
        )
        session.add(item2)
        await session.commit()
        order2_id = order2.id
        print(f"Order 2 created: ID={order2_id}, Stock reduced to {prod.stock_quantity}")
        assert prod.stock_quantity == initial_stock - 3

    # Call cancel_order
    async with async_session() as session:
        cancelled = await cancel_order(session, user.id, order2_id)
        assert cancelled.status == OrderStatusEnum.cancelled
        print(f"Order 2 cancelled successfully: status={cancelled.status.value}")

    async with async_session() as session:
        prod = await session.get(Product, product_id)
        print(f"Product Stock after cancel_order: {prod.stock_quantity}")
        assert prod.stock_quantity == initial_stock, "Stock must be restored after cancel_order!"
        print("Test 3 SUCCESS: cancel_order restored stock correctly!")

    print("\nALL STEP 9 ORDER STATUS & STOCK RECONCILIATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_step9_tests())
