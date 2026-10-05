from fastapi import APIRouter, Depends, HTTPException, status
from app.db.config import SessionDep
from app.account.models import User
from app.account.deps import get_current_user
from app.payment.schemas import PaymentOut
from app.payment.services import get_payment_by_order_id, list_payments_by_user

router = APIRouter()

@router.get("/{order_id}", response_model=PaymentOut)
async def get_payment_status_by_order(
  session: SessionDep,
  order_id: int,
  user: User = Depends(get_current_user)
):
  payment = await get_payment_by_order_id(session, order_id, user.id)
  if not payment:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
  return payment

@router.get("", response_model=list[PaymentOut])
async def get_all_payments_by_user(
  session: SessionDep,
  user: User = Depends(get_current_user)
):
  payments =  await list_payments_by_user(session, user.id)
  return payments