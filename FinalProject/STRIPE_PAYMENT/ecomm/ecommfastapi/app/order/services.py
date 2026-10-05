from typing import Sequence
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.cart.models import CartItem
from app.payment.services import create_payment
from app.payment.schemas import PaymentCreate
from app.product.models import Product
from app.shipping.models import ShippingAddress, ShippingStatus, ShippingStatusEnum
from app.order.models import Order, OrderItem, OrderStatusEnum
from app.payment.models import Payment, PaymentStatusEnum, PaymentGatewayEnum
from app.payment.gateways import get_payment_gateway
from app.payment.gateways.stripe import StripePaymentGateway
from app.order.stock import restore_order_stock


async def checkout(
    session: AsyncSession,
    user_id: int,
    payment_data: PaymentCreate
) -> Order:
    stmt = (
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(selectinload(CartItem.product))
        .with_for_update()
    )
    result = await session.scalars(stmt)
    cart_items = list(result.all())

    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Cart is empty"
        )

    total_price = Decimal("0.0")
    order_items: list[OrderItem] = []

    for item in cart_items:
        if not item.product:
            continue

        if item.product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {item.product.title}"
            )

        if item.product.price != item.price:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Price mismatch for {item.product.title}"
            )

        total_price += Decimal(str(item.price)) * item.quantity
        order_items.append(
            OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price
            )
        )

    if abs(total_price - Decimal(str(payment_data.amount))) > Decimal("0.01"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount does not match cart total"
        )

    address = await session.get(ShippingAddress, payment_data.shipping_address_id)
    if not address or address.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or unauthorized shipping address"
        )

    order = Order(
        user_id=user_id,
        total_price=float(total_price),
        shipping_address_id=payment_data.shipping_address_id,
        status=OrderStatusEnum.pending
    )
    session.add(order)
    await session.flush()

    payment = await create_payment(
        session=session,
        data=payment_data,
        user_id=user_id,
        order_id=order.id
    )

    if payment.status == PaymentStatusEnum.failed:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment failed or was declined"
        )

    # If the payment was authorized & settled synchronously (Mock gateway):
    if payment.is_paid:
        order.status = OrderStatusEnum.confirmed
        shipping_status = ShippingStatus(
            order_id=order.id,
            status=ShippingStatusEnum.pending
        )
        session.add(shipping_status)
    else:
        # For asynchronous gateways like Stripe:
        # Order remains in 'pending' status awaiting webhook confirmation
        order.status = OrderStatusEnum.pending

    for oi in order_items:
        oi.order_id = order.id
        session.add(oi)
        
        product = await session.get(Product, oi.product_id)
        if product:
            product.stock_quantity -= oi.quantity

    for item in cart_items:
        await session.delete(item)

    await session.commit()

    fetch_stmt = (
        select(Order)
        .where(Order.id == order.id)
        .options(
            selectinload(Order.orderitems).selectinload(OrderItem.product),
            selectinload(Order.shipping_address),
            selectinload(Order.shipping_status),
            selectinload(Order.payment)
        )
    )
    reloaded_order = (await session.scalars(fetch_stmt)).first()
    if reloaded_order and reloaded_order.payment and hasattr(payment, "client_secret"):
        reloaded_order.payment.client_secret = payment.client_secret
    return reloaded_order

async def get_placed_order_for_user(
    session: AsyncSession, 
    user_id: int
) -> Sequence[Order]:
    stmt = (
        select(Order)
        .where(Order.user_id == user_id)
        .options(
            selectinload(Order.orderitems).selectinload(OrderItem.product),
            selectinload(Order.shipping_address),
            selectinload(Order.shipping_status),
            selectinload(Order.payment)
        )
        .order_by(Order.id.desc())
    )
    result = await session.scalars(stmt)
    orders = list(result.all())

    # Active Reconciliation: check pending Stripe payments against live Stripe status
    stripe_gateway = None
    has_updates = False
    for order in orders:
        if (
            order.status == OrderStatusEnum.pending
            and order.payment
            and order.payment.payment_gateway == PaymentGatewayEnum.stripe
            and not order.payment.is_paid
            and order.payment.pg_order_id
        ):
            if stripe_gateway is None:
                try:
                    stripe_gateway = get_payment_gateway(PaymentGatewayEnum.stripe)
                except Exception:
                    break
            if isinstance(stripe_gateway, StripePaymentGateway):
                try:
                    remote_intent = await stripe_gateway.retrieve_payment_intent(order.payment.pg_order_id)
                    if remote_intent.get("status") == "succeeded":
                        order.payment.is_paid = True
                        order.payment.status = PaymentStatusEnum.success
                        if remote_intent.get("latest_charge"):
                            order.payment.pg_payment_id = remote_intent.get("latest_charge")
                        order.status = OrderStatusEnum.confirmed
                        if not order.shipping_status:
                            shipping = ShippingStatus(order_id=order.id, status=ShippingStatusEnum.pending)
                            session.add(shipping)
                            order.shipping_status = shipping
                        has_updates = True
                except Exception as e:
                    pass
    if has_updates:
        await session.commit()

    return orders

async def get_order_by_id(
    session: AsyncSession,
    user_id: int,
    order_id: int
) -> Order | None:
    stmt = (
        select(Order)
        .where(Order.id == order_id, Order.user_id == user_id)
        .options(
            selectinload(Order.orderitems).selectinload(OrderItem.product),
            selectinload(Order.shipping_address),
            selectinload(Order.shipping_status),
            selectinload(Order.payment)
        )
    )
    result = await session.scalars(stmt)
    return result.first()

async def cancel_order(
    session: AsyncSession,
    user_id: int,
    order_id: int
) -> Order:
    order = await get_order_by_id(session, user_id, order_id)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Order not found"
        )
    
    # 1. Prevent cancelling an already cancelled order
    if order.status == OrderStatusEnum.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Order is already cancelled"
        )
    
    # 2. Allow cancellation only while fulfillment is pending or not yet created
    if order.shipping_status and order.shipping_status.status != ShippingStatusEnum.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Cannot cancel order once it has been processed or shipped"
        )
    
    # 3. Update order and shipping status
    order.status = OrderStatusEnum.cancelled
    if order.shipping_status:
        order.shipping_status.status = ShippingStatusEnum.cancelled

    # 4. Restore catalog stock for each item in the order
    await restore_order_stock(session, order.id)


    # 5. Process refund or cancellation with payment provider
    payment_stmt = select(Payment).where(Payment.order_id == order.id)
    payment_res = await session.scalars(payment_stmt)
    payment = payment_res.first()
    if payment:
        if payment.is_paid:
            # Payment was completed: issue a real refund to user's payment method!
            gateway = get_payment_gateway(payment.payment_gateway)
            target_id = payment.pg_order_id or payment.pg_payment_id
            if target_id:
                refund_res = await gateway.refund_payment(
                    payment_id=target_id,
                    amount=payment.amount,
                    currency=payment.currency,
                    reason="requested_by_customer",
                    metadata={"order_id": str(order.id), "user_id": str(user_id)}
                )
                payment.status = PaymentStatusEnum.refunded
                payment.is_paid = False
                refund_id = refund_res.get("refund_id")
                payment.error_message = f"Refunded: {refund_id}" if refund_id else "Refunded successfully"
            else:
                payment.status = PaymentStatusEnum.refunded
                payment.is_paid = False
        else:
            # Payment was not paid: cancel pending intent if Stripe
            if payment.payment_gateway == PaymentGatewayEnum.stripe and payment.pg_order_id:
                stripe_gw = get_payment_gateway(PaymentGatewayEnum.stripe)
                if isinstance(stripe_gw, StripePaymentGateway):
                    await stripe_gw.cancel_payment_intent(payment.pg_order_id)
            payment.status = PaymentStatusEnum.cancelled
            payment.is_paid = False

    await session.commit()

    # 6. Return fresh reloaded order with eager-loaded relations
    return await get_order_by_id(session, user_id, order_id)



async def all_placed_order(
    session: AsyncSession,
    shipping_status: str | None = None,
    order_status: str | None = None,
    user_id: int | None = None
) -> Sequence[Order]:
    stmt = (
        select(Order)
        .options(
            selectinload(Order.orderitems).selectinload(OrderItem.product),
            selectinload(Order.shipping_address),
            selectinload(Order.shipping_status),
            selectinload(Order.payment)
        )
        .order_by(Order.id.desc())
    )

    # Filter by user if requested
    if user_id:
        stmt = stmt.where(Order.user_id == user_id)

    # Filter by order status (e.g., confirmed, cancelled)
    if order_status:
        stmt = stmt.where(Order.status == order_status)

    # Filter by shipping status (e.g., pending, shipped, delivered)
    if shipping_status:
        stmt = stmt.join(Order.shipping_status).where(ShippingStatus.status == shipping_status)

    result = await session.scalars(stmt)
    return result.unique().all()
