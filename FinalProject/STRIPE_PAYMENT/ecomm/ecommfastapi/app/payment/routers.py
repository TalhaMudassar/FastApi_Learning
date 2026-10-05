from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
import stripe
from app.payment.config import configure_stripe
from app.db.config import SessionDep
from app.account.models import User
from app.account.deps import get_current_user
from app.payment.schemas import (
    PaymentOut,
    PaymentIntentCreateRequest,
    PaymentIntentResponse,
    PaymentStatusResponse,
)
from app.payment.services import (
    get_payment_by_order_id,
    list_payments_by_user,
    create_or_get_payment_intent,
    get_payment_status,
    process_stripe_webhook_event,
)

router = APIRouter()

@router.get("", response_model=list[PaymentOut])
async def get_all_payments_by_user(
    session: SessionDep,
    user: User = Depends(get_current_user)
):
    """List all payment records for the current authenticated user."""
    return await list_payments_by_user(session, user.id)

@router.get("/{order_id}/status", response_model=PaymentStatusResponse)
async def check_detailed_payment_status(
    session: SessionDep,
    order_id: int,
    user: User = Depends(get_current_user),
    client_secret: str | None = None
):
    """
    Get detailed payment status for an order, including live gateway status from Stripe.
    """
    return await get_payment_status(
        session=session,
        order_id=order_id,
        user_id=user.id,
        client_secret=client_secret
    )

@router.get("/{order_id}/public-status", response_model=PaymentStatusResponse)
async def check_public_payment_status(
    session: SessionDep,
    order_id: int,
    client_secret: str
):
    """
    Public payment status lookup authorized strictly via the payment intent client_secret.
    """
    return await get_payment_status(
        session=session,
        order_id=order_id,
        user_id=None,
        client_secret=client_secret
    )

@router.post("/create-intent/{order_id}", response_model=PaymentIntentResponse)
async def create_payment_intent_for_order(
    session: SessionDep,
    order_id: int,
    data: PaymentIntentCreateRequest = PaymentIntentCreateRequest(),
    user: User = Depends(get_current_user)
):
    """
    Create or retrieve a Stripe PaymentIntent with client_secret for an order.
    """
    return await create_or_get_payment_intent(
        session=session,
        order_id=order_id,
        user_id=user.id,
        currency=data.currency
    )

import logging

logger = logging.getLogger(__name__)

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    session: SessionDep,
    stripe_signature: str | None = Header(None, alias="Stripe-Signature"),
):
    """
    Stripe webhook endpoint with cryptographic signature verification.
    Verifies payload authenticity using HMAC-SHA256 and dispatches event handling.
    """
    settings = configure_stripe()
    if not stripe_signature:
        logger.warning("Rejected Stripe webhook: Missing Stripe-Signature header")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe-Signature header"
        )

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.SignatureVerificationError as e:
        logger.warning(f"Rejected Stripe webhook: Invalid signature ({e})")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid webhook signature: {str(e)}"
        )
    except ValueError as e:
        logger.warning(f"Rejected Stripe webhook: Malformed JSON payload ({e})")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid webhook payload: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error parsing Stripe webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook parsing error: {str(e)}"
        )

    if hasattr(event, "to_dict"):
        event = event.to_dict()

    try:
        logger.info(f"Processing verified Stripe webhook: id={event.get('id')}, type={event.get('type')}")
        return await process_stripe_webhook_event(session, event)
    except Exception as e:
        logger.exception(f"Unexpected server error while processing webhook {event.get('id')}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error while processing payment event"
        )



@router.get("/{order_id}", response_model=PaymentOut)
async def get_payment_record_by_order(
    session: SessionDep,
    order_id: int,
    user: User = Depends(get_current_user)
):
    """Get the database payment record for an order."""
    payment = await get_payment_by_order_id(session, order_id, user.id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Payment not found"
        )
    return payment