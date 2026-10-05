from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.payment.models import Payment, PaymentGatewayEnum, PaymentStatusEnum
from app.payment.schemas import PaymentCreate
from app.payment.utils import generate_mock_ids

# This function will be used in order/services.py - checkout
async def create_payment(
    session: AsyncSession,
    data: PaymentCreate,
    user_id: int,
    order_id: int
) -> Payment:
  
  # Convert the provided gateway string into a PaymentGatewayEnum instance
  gateway = PaymentGatewayEnum(data.gateway)

  # Handle payments based on the selected gateway
  if gateway == PaymentGatewayEnum.mock:
    is_success = data.simulate_success
    payment_status = PaymentStatusEnum.success if is_success else PaymentStatusEnum.failed
    pg_order_id, pg_payment_id, pg_signature = generate_mock_ids()

  elif gateway == PaymentGatewayEnum.razorpay:
    # Razorpay integration will be implemented here in the future
    pass

  else:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported payment gateway")
  
  # Create a Payment model instance with the collected data
  payment = Payment(
    order_id=order_id,
    user_id=user_id,
    amount=data.amount,
    status=payment_status,
    is_paid = (payment_status == PaymentStatusEnum.success),
    payment_gateway=gateway,
    pg_order_id=pg_order_id,
    pg_payment_id=pg_payment_id,
    pg_signature=pg_signature,
  )

  session.add(payment)
  await session.commit()
  await session.refresh(payment)
  return payment

async def get_payment_by_order_id(
    session: AsyncSession,
    order_id: int,
    user_id: int
):
  stmt = select(Payment).where(Payment.order_id == order_id, Payment.user_id == user_id)
  result = await session.execute(stmt)
  return result.scalar_one_or_none()

async def list_payments_by_user(session: AsyncSession, user_id: int):
  stmt = select(Payment).where(Payment.user_id == user_id)
  result = await session.execute(stmt)
  return result.scalars().all()