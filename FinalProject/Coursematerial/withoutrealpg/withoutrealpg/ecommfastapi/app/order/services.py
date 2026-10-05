from fastapi import HTTPException, status
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.cart.models import CartItem
from app.payment.services import create_payment
from app.product.models import Product
from app.shipping.models import ShippingAddress, ShippingStatus, ShippingStatusEnum
from app.order.models import Order, OrderItem, OrderStatusEnum
from app.payment.schemas import PaymentCreate

async def checkout(
    session: AsyncSession,
    user_id: int,
    payment_data: PaymentCreate
) -> Order:
  # Fetch all cart items for the user, locking rows for update (to prevent race conditions)
  stmt = select(CartItem).where(CartItem.user_id == user_id).options(selectinload(CartItem.product)).with_for_update()

  result = await session.execute(stmt)
  cart_items = result.scalars().all()

  # If no items found, cart is empty → checkout not possible
  if not cart_items:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")
  
  # Track total cost
  total_price = Decimal("0.0")  
  # Will store OrderItem instances for bulk add    
  order_items: list[OrderItem] = [] 

  # Validate each cart item
  for item in cart_items:
    if not item.product:
      # Skip if product no longer exists (rare case)
      continue

    # Check stock availability
    if item.product.stock_quantity < item.quantity:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock")
    
    # Ensure price consistency (prevents price manipulation on frontend)
    if item.product.price != item.price:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Price mismatch")
    
    # Add to total price (Decimal used to prevent floating point errors)
    total_price += Decimal(str(item.price)) * item.quantity

    # Prepare OrderItem entry for this product
    order_items.append(OrderItem(
      product_id = item.product_id,
      quantity = item.quantity,
      price = item.price
    ))

  # Check that payment amount matches cart total (allowing 0.01 difference due to float precision)
  if abs(total_price - Decimal(str(payment_data.amount))) > Decimal("0.01"):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment amount does not match cart total")
  
  # Validate shipping address
  address = await session.get(ShippingAddress, payment_data.shipping_address_id)
  if not address or address.user_id != user_id:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid shipping address")
  
  # Create new Order (status will be updated after payment success)
  order = Order(
    user_id = user_id,
    total_price = float(total_price),
    shipping_address_id = payment_data.shipping_address_id
  )
  session.add(order)
  # Ensure order.id is generated before creating payment
  await session.flush()

  # Process payment
  payment = await create_payment(
    session = session,
    data = payment_data,
    user_id=user_id,
    order_id=order.id
  )

  # If payment fails, rollback transaction and abort checkout
  if not payment.is_paid:
    await session.rollback()
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment failed")
  
  # Update order status to confirmed after payment
  order.status = OrderStatusEnum.confirmed
  session.add(order)

  # Create shipping status entry (starts as pending)
  shipping_status = ShippingStatus(
    order_id = order.id,
    status = ShippingStatusEnum.pending
  )
  session.add(shipping_status)

  # Add order items to DB and update product stock
  for oi in order_items:
    oi.order_id = order.id
    session.add(oi)
    # Reduce stock quantity for each product
    product = await session.get(Product, oi.product_id)
    if product:
      product.stock_quantity -= oi.quantity

  # Clear the user's cart
  for item in cart_items:
    await session.delete(item)

  # Commit all changes to the database
  await session.commit()
  await session.refresh(order)

  # Fetch the order again with related entities (items, address, shipping)
  stmt = (
    select(Order)
    .where(Order.id == order.id)
    .options(
      selectinload(Order.orderitems),
      selectinload(Order.shipping_address),
      selectinload(Order.shipping_status),
      )
  )

  result = await session.execute(stmt)
  return result.scalar_one()

async def get_placed_order_for_user(session: AsyncSession, user_id: int):
  stmt = (select(Order)
          .where(Order.user_id == user_id)
          .options(
            selectinload(Order.orderitems),
            selectinload(Order.orderitems).selectinload(OrderItem.product))
          )
  result = await session.execute(stmt)
  return result.scalars().all()

async def get_order_by_id(
    session: AsyncSession,
    user_id: int,
    order_id: int
):
  stmt = (select(Order)
          .where(Order.id == order_id, Order.user_id == user_id)
          .options(selectinload(Order.orderitems)))
  result = await session.execute(stmt)
  return result.scalar_one_or_none()

async def cancel_order(
    session: AsyncSession,
    user_id: int,
    order_id: int
):
  order = await get_order_by_id(session, user_id, order_id)

  if not order:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
  
  if not order.shipping_status or order.shipping_status.status != ShippingStatusEnum.pending:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only orders with pending shipping status can be cancelled")
  
  order.status = OrderStatusEnum.cancelled
  order.shipping_status.status = ShippingStatusEnum.cancelled
  await session.commit()
  await session.refresh(order)
  return order

async def all_placed_order(
    session: AsyncSession,
    shipping_status: str | None = None,
    user_id: int | None = None
):
    stmt = select(Order).where(Order.status == OrderStatusEnum.confirmed).options(
        selectinload(Order.orderitems).selectinload(OrderItem.product),
        selectinload(Order.shipping_status)
    )

    # Filter by user if provided
    if user_id:
        stmt = stmt.where(Order.user_id == user_id)

    # Filter by shipping status if provided
    if shipping_status:
        stmt = stmt.join(Order.shipping_status).where(ShippingStatus.status == shipping_status)

    result = await session.execute(stmt)
    return result.scalars().all()



