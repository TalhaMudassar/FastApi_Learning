from typing import Sequence
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.payment.models import Payment, PaymentGatewayEnum, PaymentStatusEnum
from app.payment.schemas import PaymentCreate
from app.payment.utils import generate_mock_ids

async def create_payment(
    session: AsyncSession,
    data: PaymentCreate,
    user_id: int,
    order_id: int
) -> Payment:
    gateway = PaymentGatewayEnum(data.gateway)

    if gateway == PaymentGatewayEnum.mock:
        is_success = bool(data.simulate_success)
        payment_status = PaymentStatusEnum.success if is_success else PaymentStatusEnum.failed
        pg_order_id, pg_payment_id, pg_signature = generate_mock_ids()

    elif gateway == PaymentGatewayEnum.razorpay:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED, 
            detail="Razorpay gateway integration pending"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Unsupported payment gateway"
        )

    payment = Payment(
        order_id=order_id,
        user_id=user_id,
        amount=data.amount,
        status=payment_status,
        is_paid=(payment_status == PaymentStatusEnum.success),
        payment_gateway=gateway,
        pg_order_id=pg_order_id,
        pg_payment_id=pg_payment_id,
        pg_signature=pg_signature,
    )

    session.add(payment)
    return payment

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