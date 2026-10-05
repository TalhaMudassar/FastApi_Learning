import logging
from typing import Sequence
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.payment.models import (
    Payment,
    PaymentGatewayEnum,
    PaymentStatusEnum,
    ProcessedStripeEvent,
)
from app.payment.schemas import (
    PaymentCreate,
    PaymentIntentResponse,
    PaymentStatusResponse,
)
from app.payment.gateways import get_payment_gateway
from app.payment.gateways.stripe import StripePaymentGateway
from app.order.models import Order, OrderStatusEnum
from app.shipping.models import ShippingStatus, ShippingStatusEnum
from app.order.stock import restore_order_stock
from app.payment.idempotency import is_event_processed, commit_processed_event

logger = logging.getLogger(__name__)



async def create_payment(
    session: AsyncSession,
    data: PaymentCreate,
    user_id: int,
    order_id: int
) -> Payment:
    try:
        gateway_enum = PaymentGatewayEnum(data.gateway)
        gateway = get_payment_gateway(gateway_enum)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Unsupported payment gateway"
        ) from exc

    result = await gateway.create_payment(
        amount=Decimal(str(data.amount)),
        order_id=order_id,
        user_id=user_id,
        simulate_success=data.simulate_success
    )

    payment = Payment(
        order_id=order_id,
        user_id=user_id,
        amount=float(data.amount),
        currency="usd",
        status=result.status,
        is_paid=result.is_paid,
        payment_gateway=gateway_enum,
        pg_order_id=result.pg_order_id,
        pg_payment_id=result.pg_payment_id,
        pg_signature=result.pg_signature,
        client_secret=result.client_secret,
    )

    session.add(payment)
    await session.flush()
    return payment

async def create_or_get_payment_intent(
    session: AsyncSession,
    order_id: int,
    user_id: int,
    currency: str = "usd"
) -> PaymentIntentResponse:
    """
    Creates or retrieves a Stripe PaymentIntent for an existing order.
    Validates ownership and verifies the order has not already been settled.
    """
    order = await session.get(Order, order_id)
    if not order or order.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    if order.status == OrderStatusEnum.confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order has already been confirmed and paid"
        )

    stripe_gateway = get_payment_gateway(PaymentGatewayEnum.stripe)
    if not isinstance(stripe_gateway, StripePaymentGateway):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe gateway unavailable"
        )

    # Check if a payment record already exists for this order
    payment_stmt = select(Payment).where(
        Payment.order_id == order_id,
        Payment.user_id == user_id
    )
    payment = (await session.scalars(payment_stmt)).first()

    # If an intent already exists for this order, check live Stripe status
    if payment and payment.client_secret and payment.pg_order_id and not payment.is_paid:
        try:
            remote_intent = await stripe_gateway.retrieve_payment_intent(payment.pg_order_id)
            remote_status = remote_intent.get("status")
            if remote_status == "succeeded":
                # Already paid on Stripe! Reconcile immediately
                logger.info(f"Reconciling already-succeeded PaymentIntent for order {order.id}")
                payment.is_paid = True
                payment.status = PaymentStatusEnum.success
                if remote_intent.get("latest_charge"):
                    payment.pg_payment_id = remote_intent.get("latest_charge")
                order.status = OrderStatusEnum.confirmed
                shipping_stmt = select(ShippingStatus).where(ShippingStatus.order_id == order.id)
                shipping = (await session.scalars(shipping_stmt)).first()
                if not shipping:
                    session.add(ShippingStatus(order_id=order.id, status=ShippingStatusEnum.pending))
                await session.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This order has already been paid and confirmed."
                )
            elif remote_status in ("requires_payment_method", "requires_confirmation", "requires_action"):
                return PaymentIntentResponse(
                    order_id=order.id,
                    payment_id=payment.id,
                    payment_intent_id=payment.pg_order_id,
                    client_secret=payment.client_secret,
                    amount=float(order.total_price),
                    currency=payment.currency,
                    status=payment.status.value,
                    publishable_key=stripe_gateway.settings.STRIPE_PUBLISHABLE_KEY,
                )
            # If in terminal failed/canceled state, fall through to create a new PaymentIntent below
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Could not retrieve existing PaymentIntent for order {order_id}: {e}")

    result = await stripe_gateway.create_payment(
        amount=Decimal(str(order.total_price)),
        order_id=order.id,
        user_id=user_id,
        currency=currency
    )


    if not payment:
        payment = Payment(
            order_id=order.id,
            user_id=user_id,
            amount=float(order.total_price),
            currency=currency.lower(),
            status=result.status,
            is_paid=result.is_paid,
            payment_gateway=PaymentGatewayEnum.stripe,
            pg_order_id=result.pg_order_id,
            pg_payment_id=result.pg_payment_id,
            pg_signature=result.pg_signature,
            client_secret=result.client_secret,
        )
        session.add(payment)
    else:
        payment.payment_gateway = PaymentGatewayEnum.stripe
        payment.pg_order_id = result.pg_order_id
        payment.client_secret = result.client_secret
        payment.currency = currency.lower()
        payment.status = result.status
        payment.is_paid = result.is_paid

    await session.commit()
    await session.refresh(payment)

    return PaymentIntentResponse(
        order_id=order.id,
        payment_id=payment.id,
        payment_intent_id=result.pg_order_id or "",
        client_secret=result.client_secret or "",
        amount=float(order.total_price),
        currency=currency.lower(),
        status=payment.status.value,
        publishable_key=stripe_gateway.settings.STRIPE_PUBLISHABLE_KEY,
    )

async def get_payment_status(
    session: AsyncSession,
    order_id: int,
    user_id: int | None = None,
    client_secret: str | None = None
) -> PaymentStatusResponse:
    """
    Returns the current payment status for an order, querying live gateway status if Stripe.
    Authorizes via matching user_id OR matching payment client_secret.
    """
    order = await session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    payment_stmt = select(Payment).where(Payment.order_id == order_id)
    payment = (await session.scalars(payment_stmt)).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found for this order"
        )

    # Authorization verification
    authorized = False
    if user_id is not None and order.user_id == user_id:
        authorized = True
    elif client_secret and (
        (payment.client_secret and client_secret.strip() == payment.client_secret.strip())
        or (payment.pg_order_id and client_secret.strip() == payment.pg_order_id.strip())
    ):
        authorized = True

    if not authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to access this payment status"
        )

    gateway_status = None
    if payment.payment_gateway == PaymentGatewayEnum.stripe and payment.pg_order_id:
        stripe_gateway = get_payment_gateway(PaymentGatewayEnum.stripe)
        if isinstance(stripe_gateway, StripePaymentGateway):
            try:
                remote_intent = await stripe_gateway.retrieve_payment_intent(payment.pg_order_id)
                gateway_status = remote_intent.get("status")
                
                # Active Server-Side Reconciliation Fallback
                if gateway_status == "succeeded" and not payment.is_paid:
                    logger.info(f"Reconciling successful Stripe payment for order #{order.id}")
                    payment.is_paid = True
                    payment.status = PaymentStatusEnum.success
                    if remote_intent.get("latest_charge"):
                        payment.pg_payment_id = remote_intent.get("latest_charge")
                    order.status = OrderStatusEnum.confirmed
                    
                    shipping_stmt = select(ShippingStatus).where(ShippingStatus.order_id == order.id)
                    shipping = (await session.scalars(shipping_stmt)).first()
                    if not shipping:
                        session.add(ShippingStatus(order_id=order.id, status=ShippingStatusEnum.pending))
                    await session.commit()
            except Exception as e:
                logger.error(f"Error querying live Stripe status for order #{order_id}: {e}")
                gateway_status = "unavailable"

    return PaymentStatusResponse(
        order_id=order.id,
        payment_id=payment.id,
        amount=float(payment.amount),
        status=payment.status.value,
        is_paid=payment.is_paid,
        payment_gateway=payment.payment_gateway.value,
        pg_order_id=payment.pg_order_id,
        gateway_status=gateway_status,
        order_status=order.status.value
    )

async def get_payment_by_order_id(
    session: AsyncSession,
    order_id: int,
    user_id: int
) -> Payment | None:
    stmt = select(Payment).where(
        Payment.order_id == order_id, 
        Payment.user_id == user_id
    )
    result = await session.scalars(stmt)
    return result.first()

async def list_payments_by_user(
    session: AsyncSession, 
    user_id: int
) -> Sequence[Payment]:
    stmt = (
        select(Payment)
        .where(Payment.user_id == user_id)
        .order_by(Payment.id.desc())
    )
    result = await session.scalars(stmt)
    return result.all()

async def process_stripe_webhook_event(session: AsyncSession, event: dict) -> dict:
    """
    Processes verified Stripe webhook events asynchronously, idempotently, and safely.
    Handles 'payment_intent.succeeded' and 'payment_intent.payment_failed' with
    state-machine guards and concurrent duplicate protection.
    """
    if hasattr(event, "to_dict"):
        event = event.to_dict()

    event_id = event.get("id")
    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    if not event_id or not event_type:
        return {"status": "ignored", "reason": "Malformed event payload"}

    # Layer 1: Check if this event was already processed previously
    if await is_event_processed(session, event_id):
        return {
            "status": "success",
            "message": f"Event {event_id} was already processed",
            "event_id": event_id
        }

    if event_type == "payment_intent.succeeded":
        pi_id = data_object.get("id")
        metadata = data_object.get("metadata", {}) or {}
        order_id_str = metadata.get("order_id")

        # Find payment by Stripe PaymentIntent ID (pg_order_id) or order_id
        payment = None
        if pi_id:
            stmt = select(Payment).where(Payment.pg_order_id == pi_id)
            payment = (await session.scalars(stmt)).first()
        if not payment and order_id_str and str(order_id_str).isdigit():
            stmt = select(Payment).where(Payment.order_id == int(order_id_str))
            payment = (await session.scalars(stmt)).first()

        if payment:
            # Layer 2 State Guard: only update if not already paid
            if not payment.is_paid:
                payment.is_paid = True
                payment.status = PaymentStatusEnum.success
                payment.error_message = None
                latest_charge = data_object.get("latest_charge")
                if latest_charge and isinstance(latest_charge, str):
                    payment.pg_payment_id = latest_charge

                order = await session.get(Order, payment.order_id)
                if order and order.status != OrderStatusEnum.confirmed:
                    order.status = OrderStatusEnum.confirmed

                    # Ensure shipping_status record exists for the confirmed order
                    ship_stmt = select(ShippingStatus).where(ShippingStatus.order_id == order.id)
                    shipping_status = (await session.scalars(ship_stmt)).first()
                    if not shipping_status:
                        new_shipping = ShippingStatus(
                            order_id=order.id,
                            status=ShippingStatusEnum.pending
                        )
                        session.add(new_shipping)

        # Layer 3: Atomically commit updates and record event, protecting against concurrent duplicates
        committed = await commit_processed_event(session, event_id, event_type)
        if not committed:
            return {
                "status": "success",
                "message": f"Event {event_id} was already processed concurrently",
                "event_id": event_id
            }

        return {
            "status": "success",
            "event_id": event_id,
            "type": event_type,
            "order_id": payment.order_id if payment else None
        }

    elif event_type in ("payment_intent.payment_failed", "payment_intent.canceled"):
        pi_id = data_object.get("id")
        metadata = data_object.get("metadata", {}) or {}
        order_id_str = metadata.get("order_id")

        payment = None
        if pi_id:
            stmt = select(Payment).where(Payment.pg_order_id == pi_id)
            payment = (await session.scalars(stmt)).first()
        if not payment and order_id_str and str(order_id_str).isdigit():
            stmt = select(Payment).where(Payment.order_id == int(order_id_str))
            payment = (await session.scalars(stmt)).first()

        if payment:
            # Layer 2 State Guard: Never overwrite a successful/paid payment!
            if payment.is_paid or payment.status == PaymentStatusEnum.success:
                logger.warning(
                    f"Ignored {event_type} for order_id={payment.order_id} "
                    f"because payment is already marked as paid."
                )
            else:
                payment.is_paid = False
                payment.status = (
                    PaymentStatusEnum.cancelled if event_type == "payment_intent.canceled"
                    else PaymentStatusEnum.failed
                )
                last_err = data_object.get("last_payment_error") or {}
                payment.error_message = (
                    last_err.get("message")
                    or f"Payment {event_type.split('.')[-1]}"
                )

                order = await session.get(Order, payment.order_id)
                if order and order.status == OrderStatusEnum.pending:
                    order.status = OrderStatusEnum.cancelled
                    if order.shipping_status:
                        order.shipping_status.status = ShippingStatusEnum.cancelled
                    # Reconcile inventory: restore reserved stock
                    await restore_order_stock(session, order.id)


        committed = await commit_processed_event(session, event_id, event_type)
        if not committed:
            return {
                "status": "success",
                "message": f"Event {event_id} was already processed concurrently",
                "event_id": event_id
            }

        return {
            "status": "success",
            "event_id": event_id,
            "type": event_type,
            "order_id": payment.order_id if payment else None
        }

    elif event_type in ("charge.refunded", "charge.refund.updated"):
        pi_id = data_object.get("payment_intent")
        charge_id = data_object.get("id")

        payment = None
        if pi_id:
            stmt = select(Payment).where(Payment.pg_order_id == pi_id)
            payment = (await session.scalars(stmt)).first()
        if not payment and charge_id:
            stmt = select(Payment).where(Payment.pg_payment_id == charge_id)
            payment = (await session.scalars(stmt)).first()

        if payment:
            payment.is_paid = False
            payment.status = PaymentStatusEnum.refunded
            payment.error_message = f"Refund processed via Stripe webhook ({event_id})"

            order = await session.get(Order, payment.order_id)
            if order and order.status != OrderStatusEnum.cancelled:
                order.status = OrderStatusEnum.cancelled
                if order.shipping_status:
                    order.shipping_status.status = ShippingStatusEnum.cancelled
                await restore_order_stock(session, order.id)

        committed = await commit_processed_event(session, event_id, event_type)
        return {
            "status": "success",
            "event_id": event_id,
            "type": event_type,
            "order_id": payment.order_id if payment else None
        }

    # Fallback for unhandled Stripe event types
    committed = await commit_processed_event(session, event_id, event_type)
    return {
        "status": "ignored",
        "event_id": event_id,
        "type": event_type,
        "concurrent_dedup": not committed
    }