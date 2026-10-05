from fastapi import APIRouter, Depends, HTTPException
from app.db.config import SessionDep
from app.account.models import User
from app.account.deps import get_current_user, require_admin
from app.shipping.schemas import ShippingAddressOut, ShippingAddressCreate, ShippingAddressUpdate, ShippingStatusOut, ShippingStatusUpdate
from app.shipping.models import ShippingAddress
from app.shipping.services import create_shipping_address, delete_shipping_address_by_address_id, get_user_order_shipping_status, get_user_shipping_address_by_address_id, list_user_shipping_addresses, update_shipping_status, update_user_shipping_address_by_address_id

router = APIRouter()

@router.post("/addresses", response_model=ShippingAddressOut)
async def shipping_address_create(
  session: SessionDep,
  data: ShippingAddressCreate,
  user: User = Depends(get_current_user)
):
  return await create_shipping_address(session, user.id, data)

@router.get("/addresses", response_model=list[ShippingAddressOut])
async def shipping_addresses_user_list(
  session: SessionDep,
  user: User = Depends(get_current_user)
):
  return await list_user_shipping_addresses(session, user.id)

@router.get("/addresses/{address_id}", response_model=ShippingAddressOut)
async def shipping_address_user_by_address_id(
  session: SessionDep,
  address_id: int,
  user: User = Depends(get_current_user)
):
  return await get_user_shipping_address_by_address_id(session, address_id, user.id)

@router.patch("/addresses/{address_id}", response_model=ShippingAddressOut)
async def user_shipping_address_update_by_address_id(
  session: SessionDep,
  address_id: int,
  data: ShippingAddressUpdate,
  user: User = Depends(get_current_user)
):
  return await update_user_shipping_address_by_address_id(session, address_id, user.id, data)

@router.delete("/addresses/{address_id}")
async def shipping_address_delete_by_address_id(
  session: SessionDep,
  address_id: int,
  user: User = Depends(get_current_user)
):
  return await delete_shipping_address_by_address_id(session, user.id, address_id)

@router.get("/status/{order_id}", response_model=ShippingStatusOut)
async def shipping_status_for_user_order(
  session: SessionDep,
  order_id: int,
  user: User = Depends(get_current_user)
):
  return await get_user_order_shipping_status(session, order_id, user.id)

@router.patch("/status/{order_id}", response_model=ShippingStatusOut)
async def change_shipping_status(
    session: SessionDep,
    order_id: int,
    data: ShippingStatusUpdate,
    admin_user = Depends(require_admin)  # Only admin can update
):
    return await update_shipping_status(session, order_id, data.status)
