from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.cart.models import CartItem
from app.cart.schemas import CartItemCreate, CartItemOut, CartSummary
from app.product.models import Product

async def add_to_cart(
    session: AsyncSession, 
    user_id: int, 
    data: CartItemCreate
) -> CartItem:
    product = await session.get(Product, data.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Product not found"
        )

    stmt = (
        select(CartItem)
        .where(CartItem.user_id == user_id, CartItem.product_id == data.product_id)
    )
    result = await session.scalars(stmt)
    existing_item = result.first()

    target_quantity = (existing_item.quantity + data.quantity) if existing_item else data.quantity

    if product.stock_quantity < target_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Only {product.stock_quantity} available."
        )

    if existing_item:
        existing_item.quantity = target_quantity
        existing_item.price = product.price
        session.add(existing_item)
        await session.commit()
        await session.refresh(existing_item)
        return existing_item

    new_cart_item = CartItem(
        user_id=user_id,
        product_id=data.product_id,
        quantity=data.quantity,
        price=product.price
    )
    session.add(new_cart_item)
    await session.commit()
    await session.refresh(new_cart_item)
    return new_cart_item

async def list_user_cart(
    session: AsyncSession,
    user_id: int
) -> CartSummary:
    stmt = (
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(selectinload(CartItem.product))
    )
    result = await session.scalars(stmt)
    cart_items = list(result.all())

    cart_data: list[CartItemOut] = []
    total_quantity = 0
    total_price = 0.0

    for item in cart_items:
        if not item.product:
            continue
        price = float(item.price)
        quantity = item.quantity
        line_total = round(price * quantity, 2)
        total_price += line_total
        total_quantity += quantity

        cart_data.append(
            CartItemOut(
                id=item.id,
                product_id=item.product_id,
                user_id=user_id,
                product_title=item.product.title,
                quantity=quantity,
                price=price,
                total=line_total
            )
        )

    return CartSummary(
        items=cart_data,
        total_quantity=total_quantity,
        total_price=round(total_price, 2)
    )

async def change_cart_item_quantity_by_product(
    session: AsyncSession,
    product_id: int,
    user_id: int,
    delta: int
):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Product not found"
        )

    stmt = select(CartItem).where(
        CartItem.user_id == user_id, 
        CartItem.product_id == product_id
    )
    result = await session.scalars(stmt)
    item = result.first()

    if not item:
        if delta < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Item not in cart"
            )
        
        if product.stock_quantity < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Insufficient stock"
            )
        
        new_item = CartItem(
            user_id=user_id,
            product_id=product_id,
            quantity=1,
            price=product.price
        )
        session.add(new_item)
        await session.commit()
        await session.refresh(new_item)
        
        item_price = float(new_item.price)
        return CartItemOut(
            id=new_item.id,
            product_id=new_item.product_id,
            user_id=user_id,
            product_title=product.title,
            quantity=new_item.quantity,
            price=item_price,
            total=round(item_price * new_item.quantity, 2)
        )

    new_quantity = item.quantity + delta

    if new_quantity <= 0:
        await session.delete(item)
        await session.commit()
        return {"message": "Item removed from cart"}

    if product.stock_quantity < new_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Insufficient stock. Only {product.stock_quantity} available."
        )

    item.quantity = new_quantity
    item.price = product.price
    session.add(item)
    await session.commit()
    await session.refresh(item)

    item_price = float(item.price)
    return CartItemOut(
        id=item.id,
        product_id=item.product_id,
        user_id=user_id,
        product_title=product.title,
        quantity=item.quantity,
        price=item_price,
        total=round(item_price * item.quantity, 2)
    )

async def delete_cart_item(session: AsyncSession, cart_item_id: int, user_id: int):
    # Lookup by both item ID and user ID to prevent unauthorized deletions
    stmt = select(CartItem).where(
        CartItem.id == cart_item_id, 
        CartItem.user_id == user_id
    )
    result = await session.scalars(stmt)
    item = result.first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Item not found in your cart"
        )
        
    await session.delete(item)
    await session.commit()