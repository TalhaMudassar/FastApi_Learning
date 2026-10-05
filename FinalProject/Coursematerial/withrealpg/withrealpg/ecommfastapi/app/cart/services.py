from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.cart.models import CartItem
from app.cart.schemas import CartItemCreate, CartItemOut, CartSummary
from app.product.models import Product
from sqlalchemy.orm import selectinload

async def list_user_cart(
    session: AsyncSession,
    user_id: int
) -> CartSummary:
  stmt = select(CartItem).where(CartItem.user_id == user_id).options(selectinload(CartItem.product))
  result = await session.execute(stmt)
  cart_items = result.scalars().all()

  cart_data: list[CartItemOut] = []
  total_quantity = 0
  total_price = 0.0

  for item in cart_items:
    if not item.product:
      continue
    price = item.price
    quantity = item.quantity
    total = price * quantity
    total_price += total
    total_quantity += quantity
    cart_data.append(CartItemOut(
      id = item.id,
      product_id= item.product_id,
      user_id = user_id,
      product_title= item.product.title,
      quantity=quantity,
      price=price,
      total=total
    ))
  return CartSummary(
    items=cart_data,
    total_quantity=total_quantity,
    total_price=total_price
  )

async def add_to_cart(
    session: AsyncSession,
    data: CartItemCreate,
    user_id: int
):
  product = await session.get(Product, data.product_id)
  if not product:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
  if product.stock_quantity < data.quantity:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")
  
  stmt = select(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == data.product_id)
  result = await session.execute(stmt)
  item = result.scalar_one_or_none()

  if item:
    item.quantity += data.quantity
    item.price = product.price
  else:
    item = CartItem(
      user_id = user_id,
      product_id = data.product_id,
      quantity = data.quantity,
      price = product.price
    )
    session.add(item)
  await session.commit()
  await session.refresh(item)

  return CartItemOut(
    id = item.id,
    user_id = item.user_id,
    product_id=item.product_id,
    product_title=product.title,
    quantity=item.quantity,
    price=product.price,
    total=round(product.price * item.quantity, 2)
  )  

async def change_cart_item_quantity_by_product(
    session: AsyncSession,
    product_id: int,
    user_id: int,
    delta: int
):
  product = await session.get(Product, product_id)
  if not product:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

  stmt = select(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == product_id)
  result = await session.execute(stmt)
  item = result.scalar_one_or_none()

  if not item:
    if delta < 0:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item not in cart")
    
    if product.stock_quantity < 1:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")
    
    new_item = CartItem(
      user_id = user_id,
      product_id = product_id,
      quantity = 1,
      price = product.price
    )
    session.add(new_item)
    await session.commit()
    await session.refresh(new_item)
    return CartItemOut(
      id=new_item.id,
      product_id=new_item.product_id,
      user_id=user_id,
      product_title=product.title,
      quantity=new_item.quantity,
      price=new_item.price,
      total=round(product.price * new_item.quantity, 2)
    )
  new_quantity = item.quantity + delta
  if new_quantity <= 0:
    await session.delete(item)
    await session.commit()
    return {"message": "Item removed from cart"}
  
  if product.stock_quantity < new_quantity:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")
  
  item.quantity = new_quantity
  item.price = product.price
  await session.commit()
  await session.refresh(item)

  return CartItemOut(
      id=item.id,
      product_id=item.product_id,
      user_id=user_id,
      product_title=product.title,
      quantity=item.quantity,
      price=item.price,
      total=round(product.price * item.quantity, 2)
  )

async def delete_cart_item(session:AsyncSession, cart_item_id: int):
  item = await session.get(CartItem, cart_item_id)
  if not item:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
  await session.delete(item)
  await session.commit()
  return item


  