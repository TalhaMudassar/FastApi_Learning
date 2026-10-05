from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.payment.models import Payment, PaymentGatewayEnum, PaymentStatusEnum
from app.payment.schemas import PaymentCreate, PaymentOut, PaymentWithPG, RazorpayCallback
from app.payment.utils import generate_mock_ids
import razorpay
from decouple import config

from app.order.models import Order, OrderStatusEnum
from app.shipping.models import ShippingStatus, ShippingStatusEnum

RAZORPAY_KEY_ID = config("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = config("RAZORPAY_KEY_SECRET")
RAZORPAY_CALLBACK_URL = config("RAZORPAY_CALLBACK_URL")

_razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# This function will be used in order/services.py - checkout
async def create_payment(
    session: AsyncSession,
    data: PaymentCreate,
    user_id: int,
    order: Order
) -> PaymentWithPG:
  
  # Convert the provided gateway string into a PaymentGatewayEnum instance
  gateway = PaymentGatewayEnum(data.gateway)

  # initialize defaults
  payment_status = None
  pg_order_id = None
  pg_payment_id = None
  pg_signature = None
  rz_data = None

  # Handle payments based on the selected gateway
  if gateway == PaymentGatewayEnum.mock:
    is_success = data.simulate_success
    payment_status = PaymentStatusEnum.success if is_success else PaymentStatusEnum.failed
    pg_order_id, pg_payment_id, pg_signature = generate_mock_ids()

    if is_success:
      order.status = OrderStatusEnum.confirmed
      session.add(ShippingStatus(order_id=order.id, status=ShippingStatusEnum.pending))
    else:
      order.status = OrderStatusEnum.cancelled
      session.add(ShippingStatus(order_id=order.id, status=ShippingStatusEnum.cancelled))

  elif gateway == PaymentGatewayEnum.razorpay:
    try:
      order_data = {
        "amount": int(float(data.amount) * 100), # paise
        "currency": "INR",
        "payment_capture": 1
      }
      razorpay_order = _razorpay_client.order.create(order_data)
    except Exception as e:
      raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Razorpay order creation failed: {e}")
    payment_status = PaymentStatusEnum.pending
    pg_order_id = razorpay_order["id"] 
    rz_data = {
      "pg_order_id": pg_order_id,
      "razorpay_key_id": RAZORPAY_KEY_ID,
      "amount": order_data["amount"],
      "currency": order_data["currency"],
      "razorpay_callback_url": RAZORPAY_CALLBACK_URL,
    }
    order.status = OrderStatusEnum.pending
  else:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported payment gateway")
  
  # Create a Payment model instance with the collected data
  payment = Payment(
    order_id=order.id,
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
  return PaymentWithPG(
    payment=PaymentOut.model_validate(payment),
    rz_data=rz_data
  )

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

async def handle_razorpay_callback(session: AsyncSession, payload: RazorpayCallback):
  order_id = payload.razorpay_order_id
  payment_id = payload.razorpay_payment_id
  signature = payload.razorpay_signature

  # Fetch payment from DB
  result = await session.execute(
      select(Payment).where(Payment.pg_order_id == order_id)
  )
  payment = result.scalar_one_or_none()
  if not payment:
      raise HTTPException(status_code=404, detail="Payment not found")
  try:
    _razorpay_client.utility.verify_payment_signature({
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": signature,
    })
  except razorpay.errors.SignatureVerificationError:
    payment.status = PaymentStatusEnum.failed
    payment.is_paid = False
    await session.commit()
    order = await session.get(Order, payment.order_id)
    if order:
        order.status = OrderStatusEnum.cancelled
        shipping_status = ShippingStatus(
            order_id=order.id,
            status=ShippingStatusEnum.cancelled
        )
        session.add(shipping_status)
        await session.commit()
    return {"status": "failed"}
  
  payment.status = PaymentStatusEnum.success
  payment.is_paid = True
  payment.pg_payment_id = payment_id
  payment.pg_signature = signature
  await session.commit()
  order = await session.get(Order, payment.order_id)
  if order:
      order.status = OrderStatusEnum.confirmed
      # Create shipping status (since payment is successful now)
      shipping_status = ShippingStatus(
          order_id=order.id,
          status=ShippingStatusEnum.pending
      )
      session.add(shipping_status)
      await session.commit()
  return {
        "status": "success",
        "rz_order_id": order_id,
        "rz_payment_id": payment_id,
    }


  
