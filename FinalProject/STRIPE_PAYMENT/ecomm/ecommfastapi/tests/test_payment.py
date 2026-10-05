import json
import time
import hmac
import hashlib
from decimal import Decimal
from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
import stripe

from app.payment.models import Payment, PaymentGatewayEnum, PaymentStatusEnum, ProcessedStripeEvent
from app.payment.schemas import PaymentCreate
from app.payment.gateways import get_payment_gateway
from app.payment.gateways.mock import MockPaymentGateway
from app.payment.gateways.stripe import StripePaymentGateway
from app.payment.config import configure_stripe
from app.payment.utils import (
    to_stripe_amount,
    from_stripe_amount,
    build_idempotency_key,
    mask_secret,
)
from app.payment.services import (
    create_payment,
    create_or_get_payment_intent,
    get_payment_by_order_id,
    list_payments_by_user,
    get_payment_status,
)
from app.order.models import Order, OrderItem, OrderStatusEnum
from app.shipping.models import ShippingAddress, ShippingStatus, ShippingStatusEnum
from app.product.models import Product
from app.account.models import User


def generate_sig(payload: str, secret: str) -> str:
    ts = int(time.time())
    signed = f"{ts}.{payload}".encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), signed, hashlib.sha256).hexdigest()
    return f"t={ts},v1={sig}"


# ==============================================================================
# 1. UNIT TESTS: Utils & Gateway Factory
# ==============================================================================

def test_currency_conversion_standard():
    assert to_stripe_amount(10.50, "usd") == 1050
    assert to_stripe_amount(Decimal("250.75"), "usd") == 25075
    assert from_stripe_amount(1050, "usd") == Decimal("10.50")


def test_currency_conversion_zero_decimal():
    assert to_stripe_amount(500, "jpy") == 500
    assert from_stripe_amount(500, "jpy") == Decimal("500")


def test_idempotency_key_builder():
    key = build_idempotency_key(order_id=42, user_id=7, action="pi_create")
    assert key == "idemp_pi_create_order_42_user_7"


def test_secret_masking():
    assert mask_secret("sk_test_1234567890abcdef") == "sk_test***cdef"
    assert mask_secret(None) == "[NOT SET]"


def test_gateway_factory():
    mock_gw = get_payment_gateway(PaymentGatewayEnum.mock)
    stripe_gw = get_payment_gateway(PaymentGatewayEnum.stripe)
    assert isinstance(mock_gw, MockPaymentGateway)
    assert isinstance(stripe_gw, StripePaymentGateway)


# ==============================================================================
# 2. HYBRID SERVICE TESTS: Mock & Stripe Payment Creation
# ==============================================================================

@pytest.mark.asyncio
async def test_mock_payment_creation(
    test_session: AsyncSession,
    mock_user: User,
    mock_shipping_address: ShippingAddress
):
    order = Order(
        user_id=mock_user.id,
        total_price=Decimal("75.00"),
        status=OrderStatusEnum.pending,
        shipping_address_id=mock_shipping_address.id
    )
    test_session.add(order)
    await test_session.commit()
    await test_session.refresh(order)

    payment_data = PaymentCreate(
        amount=75.00,
        shipping_address_id=mock_shipping_address.id,
        gateway="mock"
    )

    payment = await create_payment(
        session=test_session,
        data=payment_data,
        user_id=mock_user.id,
        order_id=order.id
    )

    assert payment.id is not None
    assert payment.is_paid is True
    assert payment.status == PaymentStatusEnum.success
    assert payment.payment_gateway == PaymentGatewayEnum.mock
    assert payment.pg_order_id.startswith("MOCK-OD-")


@pytest.mark.asyncio
async def test_stripe_payment_creation(
    test_session: AsyncSession,
    mock_user: User,
    mock_shipping_address: ShippingAddress
):
    order = Order(
        user_id=mock_user.id,
        total_price=Decimal("120.00"),
        status=OrderStatusEnum.pending,
        shipping_address_id=mock_shipping_address.id
    )
    test_session.add(order)
    await test_session.commit()
    await test_session.refresh(order)

    payment_data = PaymentCreate(
        amount=120.00,
        shipping_address_id=mock_shipping_address.id,
        gateway="stripe"
    )

    payment = await create_payment(
        session=test_session,
        data=payment_data,
        user_id=mock_user.id,
        order_id=order.id
    )

    assert payment.id is not None
    assert payment.is_paid is False
    assert payment.status == PaymentStatusEnum.pending
    assert payment.payment_gateway == PaymentGatewayEnum.stripe
    assert payment.pg_order_id.startswith("pi_")
    assert payment.client_secret is not None


@pytest.mark.asyncio
async def test_create_or_get_payment_intent(
    test_session: AsyncSession,
    mock_user: User,
    mock_shipping_address: ShippingAddress
):
    order = Order(
        user_id=mock_user.id,
        total_price=Decimal("50.00"),
        status=OrderStatusEnum.pending,
        shipping_address_id=mock_shipping_address.id
    )
    test_session.add(order)
    await test_session.commit()
    await test_session.refresh(order)

    res1 = await create_or_get_payment_intent(
        session=test_session,
        order_id=order.id,
        user_id=mock_user.id,
        currency="usd"
    )
    assert res1.order_id == order.id
    assert res1.payment_intent_id.startswith("pi_")
    assert res1.client_secret != ""

    # Second call for the same order should return the existing PaymentIntent
    res2 = await create_or_get_payment_intent(
        session=test_session,
        order_id=order.id,
        user_id=mock_user.id,
        currency="usd"
    )
    assert res2.payment_intent_id == res1.payment_intent_id


# ==============================================================================
# 3. INTEGRATION TESTS: API Endpoints
# ==============================================================================

@pytest.mark.asyncio
async def test_api_list_payments(
    test_client: AsyncClient,
    test_session: AsyncSession,
    mock_user: User,
    mock_shipping_address: ShippingAddress
):
    order = Order(
        user_id=mock_user.id,
        total_price=Decimal("40.00"),
        status=OrderStatusEnum.confirmed,
        shipping_address_id=mock_shipping_address.id
    )
    test_session.add(order)
    await test_session.commit()

    payment = Payment(
        order_id=order.id,
        user_id=mock_user.id,
        amount=40.00,
        currency="usd",
        status=PaymentStatusEnum.success,
        payment_gateway=PaymentGatewayEnum.mock,
        is_paid=True
    )
    test_session.add(payment)
    await test_session.commit()

    response = await test_client.get("/api/payments")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["order_id"] == order.id


@pytest.mark.asyncio
async def test_api_create_intent_endpoint(
    test_client: AsyncClient,
    test_session: AsyncSession,
    mock_user: User,
    mock_shipping_address: ShippingAddress
):
    order = Order(
        user_id=mock_user.id,
        total_price=Decimal("89.99"),
        status=OrderStatusEnum.pending,
        shipping_address_id=mock_shipping_address.id
    )
    test_session.add(order)
    await test_session.commit()

    response = await test_client.post(
        f"/api/payments/create-intent/{order.id}",
        json={"currency": "usd"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["order_id"] == order.id
    assert "client_secret" in data
    assert "publishable_key" in data


# ==============================================================================
# 4. WEBHOOK TESTS: Signatures, Events, Stock Reconciliation, Idempotency
# ==============================================================================

@pytest.mark.asyncio
async def test_webhook_missing_signature(test_client: AsyncClient):
    response = await test_client.post("/api/payments/webhook", content=b"{}")
    assert response.status_code == 400
    assert "Missing Stripe-Signature header" in response.json()["detail"]


@pytest.mark.asyncio
async def test_webhook_invalid_signature(test_client: AsyncClient):
    response = await test_client.post(
        "/api/payments/webhook",
        content=b"{}",
        headers={"Stripe-Signature": "t=1000,v1=tampered_signature_hex"}
    )
    assert response.status_code == 400
    assert "Invalid webhook signature" in response.json()["detail"]


@pytest.mark.asyncio
async def test_webhook_payment_succeeded_flow(
    test_client: AsyncClient,
    test_session: AsyncSession,
    mock_user: User,
    mock_shipping_address: ShippingAddress
):
    settings = configure_stripe()
    order = Order(
        user_id=mock_user.id,
        total_price=Decimal("150.00"),
        status=OrderStatusEnum.pending,
        shipping_address_id=mock_shipping_address.id
    )
    test_session.add(order)
    await test_session.commit()

    pi_id = f"pi_test_succ_{int(time.time())}"
    payment = Payment(
        order_id=order.id,
        user_id=mock_user.id,
        amount=150.00,
        currency="usd",
        status=PaymentStatusEnum.pending,
        payment_gateway=PaymentGatewayEnum.stripe,
        is_paid=False,
        pg_order_id=pi_id
    )
    test_session.add(payment)
    await test_session.commit()

    evt_id = f"evt_succ_{int(time.time())}"
    payload = json.dumps({
        "id": evt_id,
        "object": "event",
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": pi_id,
                "object": "payment_intent",
                "amount": 15000,
                "currency": "usd",
                "status": "succeeded",
                "latest_charge": "ch_mock_success_charge",
                "metadata": {"order_id": str(order.id)}
            }
        }
    })
    sig = generate_sig(payload, settings.STRIPE_WEBHOOK_SECRET)
    response = await test_client.post(
        "/api/payments/webhook",
        content=payload.encode("utf-8"),
        headers={"Content-Type": "application/json", "Stripe-Signature": sig}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Verify database updates
    await test_session.refresh(payment)
    await test_session.refresh(order)
    assert payment.is_paid is True
    assert payment.status == PaymentStatusEnum.success
    assert payment.pg_payment_id == "ch_mock_success_charge"
    assert order.status == OrderStatusEnum.confirmed

    # Verify shipping status created
    ship_stmt = select(ShippingStatus).where(ShippingStatus.order_id == order.id)
    ship = (await test_session.scalars(ship_stmt)).first()
    assert ship is not None
    assert ship.status == ShippingStatusEnum.pending

    # Test idempotency: Sending same event again returns 200 without error
    dup_res = await test_client.post(
        "/api/payments/webhook",
        content=payload.encode("utf-8"),
        headers={"Content-Type": "application/json", "Stripe-Signature": sig}
    )
    assert dup_res.status_code == 200
    assert "already processed" in dup_res.json()["message"]


@pytest.mark.asyncio
async def test_webhook_payment_failed_reconciles_stock(
    test_client: AsyncClient,
    test_session: AsyncSession,
    mock_user: User,
    mock_shipping_address: ShippingAddress,
    mock_product: Product
):
    settings = configure_stripe()
    initial_stock = mock_product.stock_quantity

    # Simulate checkout reserving 2 items
    mock_product.stock_quantity -= 2
    order = Order(
        user_id=mock_user.id,
        total_price=Decimal("199.98"),
        status=OrderStatusEnum.pending,
        shipping_address_id=mock_shipping_address.id
    )
    test_session.add(order)
    await test_session.flush()

    item = OrderItem(
        order_id=order.id,
        product_id=mock_product.id,
        quantity=2,
        price=Decimal("99.99")
    )
    test_session.add(item)

    pi_id = f"pi_test_fail_{int(time.time())}"
    payment = Payment(
        order_id=order.id,
        user_id=mock_user.id,
        amount=199.98,
        currency="usd",
        status=PaymentStatusEnum.pending,
        payment_gateway=PaymentGatewayEnum.stripe,
        is_paid=False,
        pg_order_id=pi_id
    )
    test_session.add(payment)
    await test_session.commit()

    evt_id = f"evt_fail_{int(time.time())}"
    payload = json.dumps({
        "id": evt_id,
        "object": "event",
        "type": "payment_intent.payment_failed",
        "data": {
            "object": {
                "id": pi_id,
                "object": "payment_intent",
                "amount": 19998,
                "currency": "usd",
                "status": "requires_payment_method",
                "last_payment_error": {"message": "Insufficient funds in account"},
                "metadata": {"order_id": str(order.id)}
            }
        }
    })
    sig = generate_sig(payload, settings.STRIPE_WEBHOOK_SECRET)
    response = await test_client.post(
        "/api/payments/webhook",
        content=payload.encode("utf-8"),
        headers={"Content-Type": "application/json", "Stripe-Signature": sig}
    )
    assert response.status_code == 200

    # Verify order cancelled and stock fully restored
    await test_session.refresh(order)
    await test_session.refresh(payment)
    await test_session.refresh(mock_product)

    assert order.status == OrderStatusEnum.cancelled
    assert payment.status == PaymentStatusEnum.failed
    assert "Insufficient funds" in payment.error_message
    assert mock_product.stock_quantity == initial_stock, "Reserved stock must be restored!"


# ==============================================================================
# 5. EXCEPTION MAPPING TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_stripe_card_error():
    gateway = StripePaymentGateway()
    mock_err = stripe.CardError("Card was declined", param="number", code="card_declined")
    with patch("stripe.PaymentIntent.create", side_effect=mock_err):
        with pytest.raises(HTTPException) as exc_info:
            await gateway.create_payment(amount=50.0, order_id=1, user_id=1)
        assert exc_info.value.status_code == 400
        assert "card_declined" in exc_info.value.detail


@pytest.mark.asyncio
async def test_stripe_rate_limit_error():
    gateway = StripePaymentGateway()
    mock_err = stripe.RateLimitError("Rate limit exceeded")
    with patch("stripe.PaymentIntent.create", side_effect=mock_err):
        with pytest.raises(HTTPException) as exc_info:
            await gateway.create_payment(amount=50.0, order_id=1, user_id=1)
        assert exc_info.value.status_code == 429


@pytest.mark.asyncio
async def test_stripe_connection_error():
    gateway = StripePaymentGateway()
    mock_err = stripe.APIConnectionError("Failed to reach gateway")
    with patch("stripe.PaymentIntent.create", side_effect=mock_err):
        with pytest.raises(HTTPException) as exc_info:
            await gateway.create_payment(amount=50.0, order_id=1, user_id=1)
        assert exc_info.value.status_code == 503


@pytest.mark.asyncio
async def test_stripe_authentication_error():
    gateway = StripePaymentGateway()
    mock_err = stripe.AuthenticationError("Invalid API key")
    with patch("stripe.PaymentIntent.create", side_effect=mock_err):
        with pytest.raises(HTTPException) as exc_info:
            await gateway.create_payment(amount=50.0, order_id=1, user_id=1)
        assert exc_info.value.status_code == 500


@pytest.mark.asyncio
async def test_api_get_payment_record(
    test_client: AsyncClient,
    test_session: AsyncSession,
    mock_user: User,
    mock_shipping_address: ShippingAddress
):
    order = Order(
        user_id=mock_user.id,
        total_price=Decimal("60.00"),
        status=OrderStatusEnum.confirmed,
        shipping_address_id=mock_shipping_address.id
    )
    test_session.add(order)
    await test_session.commit()

    payment = Payment(
        order_id=order.id,
        user_id=mock_user.id,
        amount=60.00,
        currency="usd",
        status=PaymentStatusEnum.success,
        payment_gateway=PaymentGatewayEnum.mock,
        is_paid=True
    )
    test_session.add(payment)
    await test_session.commit()

    # Successful retrieval
    res = await test_client.get(f"/api/payments/{order.id}")
    assert res.status_code == 200
    assert res.json()["order_id"] == order.id

    # Not found for invalid order ID
    res_404 = await test_client.get("/api/payments/99999")
    assert res_404.status_code == 404


@pytest.mark.asyncio
async def test_api_check_detailed_payment_status(
    test_client: AsyncClient,
    test_session: AsyncSession,
    mock_user: User,
    mock_shipping_address: ShippingAddress
):
    order = Order(
        user_id=mock_user.id,
        total_price=Decimal("110.00"),
        status=OrderStatusEnum.pending,
        shipping_address_id=mock_shipping_address.id
    )
    test_session.add(order)
    await test_session.commit()

    payment = Payment(
        order_id=order.id,
        user_id=mock_user.id,
        amount=110.00,
        currency="usd",
        status=PaymentStatusEnum.pending,
        payment_gateway=PaymentGatewayEnum.stripe,
        is_paid=False,
        pg_order_id="pi_mock_status_check"
    )
    test_session.add(payment)
    await test_session.commit()

    with patch.object(StripePaymentGateway, "retrieve_payment_intent", return_value={"status": "requires_payment_method"}):
        res = await test_client.get(f"/api/payments/{order.id}/status")
        assert res.status_code == 200
        data = res.json()
        assert data["order_id"] == order.id
        assert data["gateway_status"] == "requires_payment_method"


@pytest.mark.asyncio
async def test_webhook_payment_intent_canceled(
    test_client: AsyncClient,
    test_session: AsyncSession,
    mock_user: User,
    mock_shipping_address: ShippingAddress,
    mock_product: Product
):
    settings = configure_stripe()
    initial_stock = mock_product.stock_quantity

    mock_product.stock_quantity -= 1
    order = Order(
        user_id=mock_user.id,
        total_price=Decimal("99.99"),
        status=OrderStatusEnum.pending,
        shipping_address_id=mock_shipping_address.id
    )
    test_session.add(order)
    await test_session.flush()

    item = OrderItem(
        order_id=order.id,
        product_id=mock_product.id,
        quantity=1,
        price=Decimal("99.99")
    )
    test_session.add(item)

    pi_id = f"pi_test_canceled_{int(time.time())}"
    payment = Payment(
        order_id=order.id,
        user_id=mock_user.id,
        amount=99.99,
        currency="usd",
        status=PaymentStatusEnum.pending,
        payment_gateway=PaymentGatewayEnum.stripe,
        is_paid=False,
        pg_order_id=pi_id
    )
    test_session.add(payment)
    await test_session.commit()

    evt_id = f"evt_canceled_{int(time.time())}"
    payload = json.dumps({
        "id": evt_id,
        "object": "event",
        "type": "payment_intent.canceled",
        "data": {
            "object": {
                "id": pi_id,
                "object": "payment_intent",
                "amount": 9999,
                "currency": "usd",
                "status": "canceled",
                "metadata": {"order_id": str(order.id)}
            }
        }
    })
    sig = generate_sig(payload, settings.STRIPE_WEBHOOK_SECRET)
    response = await test_client.post(
        "/api/payments/webhook",
        content=payload.encode("utf-8"),
        headers={"Content-Type": "application/json", "Stripe-Signature": sig}
    )
    assert response.status_code == 200

    await test_session.refresh(order)
    await test_session.refresh(payment)
    await test_session.refresh(mock_product)

    assert order.status == OrderStatusEnum.cancelled
    assert payment.status == PaymentStatusEnum.cancelled
    assert mock_product.stock_quantity == initial_stock

