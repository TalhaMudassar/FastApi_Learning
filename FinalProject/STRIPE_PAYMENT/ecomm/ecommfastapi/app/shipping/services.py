from typing import Sequence
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.order.models import Order
from app.shipping.schemas import ShippingAddressCreate, ShippingAddressUpdate
from app.shipping.models import ShippingAddress, ShippingStatus, ShippingStatusEnum

async def create_shipping_address(
    session: AsyncSession,
    user_id: int,
    data: ShippingAddressCreate
) -> ShippingAddress:
    address = ShippingAddress(user_id=user_id, **data.model_dump())
    session.add(address)
    await session.commit()
    await session.refresh(address)
    return address

async def list_user_shipping_addresses(
    session: AsyncSession,
    user_id: int
) -> Sequence[ShippingAddress]:
    stmt = (
        select(ShippingAddress)
        .where(ShippingAddress.user_id == user_id)
        .order_by(ShippingAddress.id.desc())
    )
    result = await session.scalars(stmt)
    return result.all()

async def get_user_shipping_address_by_address_id(
    session: AsyncSession,
    address_id: int,
    user_id: int
) -> ShippingAddress:
    address = await session.get(ShippingAddress, address_id)
    if not address or address.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Address not found or not authorized"
        )
    return address

async def update_user_shipping_address_by_address_id(
    session: AsyncSession,
    address_id: int,
    user_id: int,
    data: ShippingAddressUpdate
) -> ShippingAddress:
    address = await session.get(ShippingAddress, address_id)
    if not address or address.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Address not found or not authorized"
        )

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(address, key, value)

    session.add(address)
    await session.commit()
    await session.refresh(address)
    return address

async def delete_shipping_address_by_address_id(
    session: AsyncSession, 
    user_id: int, 
    address_id: int
) -> None:
    address = await session.get(ShippingAddress, address_id)
    if not address or address.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Address not found or not authorized"
        )
    await session.delete(address)
    await session.commit()

async def get_user_order_shipping_status(
    session: AsyncSession,
    order_id: int,
    user_id: int
) -> ShippingStatus:
    stmt = (
        select(ShippingStatus)
        .join(Order, ShippingStatus.order_id == Order.id)
        .where(ShippingStatus.order_id == order_id, Order.user_id == user_id)
    )
    result = await session.scalars(stmt)
    shipping_status = result.first()

    if not shipping_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Shipping status not found or not authorized"
        )
    return shipping_status

async def update_shipping_status(
    session: AsyncSession,
    order_id: int,
    new_status: ShippingStatusEnum
) -> ShippingStatus:
    stmt = select(ShippingStatus).where(ShippingStatus.order_id == order_id)
    result = await session.scalars(stmt)
    shipping_status = result.first()

    if not shipping_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Shipping status not found"
        )
    
    shipping_status.status = new_status
    await session.commit()
    await session.refresh(shipping_status)
    return shipping_status