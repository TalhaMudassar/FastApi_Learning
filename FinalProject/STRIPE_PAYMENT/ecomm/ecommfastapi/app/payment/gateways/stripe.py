import uuid
from decimal import Decimal
from typing import Any
import logging
from fastapi import HTTPException, status
import stripe


from app.payment.config import configure_stripe, StripeSettings
from app.payment.gateways.base import BasePaymentGateway, GatewayPaymentResult
from app.payment.models import PaymentStatusEnum
from app.payment.utils import to_stripe_amount, build_idempotency_key

logger = logging.getLogger(__name__)

class StripePaymentGateway(BasePaymentGateway):
    """
    Production-grade Stripe payment gateway integration.
    Communicates seamlessly with Stripe API or local stripe-mock server.
    """

    def __init__(self, settings: StripeSettings | None = None):
        self.settings = settings or configure_stripe()
        self._ensure_configured()

    def _ensure_configured(self):
        # Ensure Stripe SDK is globally configured with our settings
        stripe.api_key = self.settings.STRIPE_SECRET_KEY
        if self.settings.STRIPE_API_BASE and self.settings.STRIPE_API_BASE.strip():
            stripe.api_base = self.settings.STRIPE_API_BASE.strip()
        else:
            stripe.api_base = "https://api.stripe.com"



    async def create_payment(
        self,
        amount: Decimal | float,
        order_id: int,
        user_id: int,
        currency: str | None = None,
        metadata: dict[str, Any] | None = None,
        simulate_success: bool = True
    ) -> GatewayPaymentResult:
        """
        Creates a Stripe PaymentIntent for the specified order and user.
        Amounts are converted to the smallest currency unit (e.g., cents).
        A deterministic idempotency key is passed to prevent duplicate charges.
        """
        charge_currency = (currency or self.settings.STRIPE_CURRENCY).lower().strip()
        stripe_amount = to_stripe_amount(amount, charge_currency)

        payment_metadata = {
            "order_id": str(order_id),
            "user_id": str(user_id),
            "source": "fastapi_backend"
        }
        if metadata:
            payment_metadata.update({str(k): str(v) for k, v in metadata.items()})

        attempt_token = uuid.uuid4().hex[:10]
        idempotency_key = build_idempotency_key(
            order_id=order_id,
            user_id=user_id,
            action="pi_create",
            attempt_id=attempt_token
        )


        try:
            logger.info(
                f"Initiating Stripe PaymentIntent: order_id={order_id}, user_id={user_id}, "
                f"amount={stripe_amount} {charge_currency}, idemp_key={idempotency_key}"
            )

            # Create the PaymentIntent using the official Stripe SDK
            intent = stripe.PaymentIntent.create(
                amount=stripe_amount,
                currency=charge_currency,
                metadata=payment_metadata,
                idempotency_key=idempotency_key,
                automatic_payment_methods={"enabled": True}
            )

            # Map Stripe status to internal PaymentStatusEnum
            is_paid = (intent.status == "succeeded")
            payment_status = PaymentStatusEnum.success if is_paid else PaymentStatusEnum.pending

            logger.info(
                f"Stripe PaymentIntent created successfully: id={intent.id}, "
                f"status={intent.status}, order_id={order_id}"
            )

            return GatewayPaymentResult(
                status=payment_status,
                is_paid=is_paid,
                pg_order_id=intent.id,
                pg_payment_id=getattr(intent, "latest_charge", None),
                pg_signature=None,
                client_secret=intent.client_secret,
                raw_response={
                    "gateway": "stripe",
                    "id": intent.id,
                    "status": intent.status,
                    "amount": intent.amount,
                    "currency": intent.currency,
                    "client_secret": intent.client_secret,
                }
            )

        except stripe.CardError as exc:
            user_msg = getattr(exc, "user_message", None) or "Payment card was declined."
            code = getattr(exc, "code", "card_declined")
            logger.warning(f"Stripe card declined for order_id={order_id}: code={code}, msg={user_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Card error ({code}): {user_msg}"
            ) from exc

        except stripe.RateLimitError as exc:
            logger.error(f"Stripe rate limit error for order_id={order_id}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Payment gateway rate limit reached. Please try again in a few moments."
            ) from exc

        except stripe.InvalidRequestError as exc:
            logger.error(f"Stripe invalid request for order_id={order_id}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid payment parameters: {getattr(exc, 'user_message', None) or str(exc)}"
            ) from exc

        except stripe.AuthenticationError as exc:
            logger.critical(f"Stripe authentication failed! Verify STRIPE_SECRET_KEY. Error: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Payment gateway configuration error. Please contact administrator."
            ) from exc

        except stripe.APIConnectionError as exc:
            logger.error(f"Stripe network connection error (target: {self.settings.STRIPE_API_BASE}): {exc}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment gateway is currently unreachable. Please check network connectivity and try again."
            ) from exc

        except stripe.StripeError as exc:
            logger.error(f"Generic Stripe error for order_id={order_id}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Payment processing error with gateway provider."
            ) from exc

    async def retrieve_payment_intent(self, payment_intent_id: str) -> dict[str, Any]:
        """
        Retrieves an existing PaymentIntent from Stripe / stripe-mock by ID.
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                "id": intent.id,
                "status": intent.status,
                "amount": intent.amount,
                "currency": intent.currency,
                "client_secret": intent.client_secret,
                "metadata": intent.metadata,
                "latest_charge": getattr(intent, "latest_charge", None),
            }
        except stripe.InvalidRequestError as exc:
            logger.warning(f"PaymentIntent '{payment_intent_id}' not found: {exc}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"PaymentIntent '{payment_intent_id}' not found."
            ) from exc
        except stripe.APIConnectionError as exc:
            logger.error(f"Stripe connection error retrieving PaymentIntent '{payment_intent_id}': {exc}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment provider temporarily unreachable."
            ) from exc
        except stripe.StripeError as exc:
            logger.error(f"Failed to retrieve Stripe PaymentIntent '{payment_intent_id}': {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Error communicating with payment provider."
            ) from exc

    async def refund_payment(
        self,
        payment_id: str,
        amount: Decimal | float | None = None,
        currency: str = "usd",
        reason: str = "requested_by_customer",
        metadata: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        Creates a Stripe Refund for a payment intent or charge.
        """
        self._ensure_configured()
        refund_kwargs: dict[str, Any] = {
            "reason": reason,
            "metadata": metadata or {},
        }
        if payment_id.startswith("pi_"):
            refund_kwargs["payment_intent"] = payment_id
        elif payment_id.startswith("ch_"):
            refund_kwargs["charge"] = payment_id
        else:
            refund_kwargs["payment_intent"] = payment_id

        if amount is not None:
            refund_kwargs["amount"] = to_stripe_amount(amount, currency)

        try:
            logger.info(f"Issuing Stripe refund for payment {payment_id} (amount={amount})")
            refund = stripe.Refund.create(**refund_kwargs)
            return {
                "status": getattr(refund, "status", "succeeded"),
                "refund_id": getattr(refund, "id", f"re_{payment_id}"),
                "amount": (refund.amount / 100.0) if hasattr(refund, "amount") else float(amount or 0),
                "currency": getattr(refund, "currency", currency),
                "gateway": "stripe"
            }
        except stripe.InvalidRequestError as exc:
            logger.error(f"Stripe refund invalid request for {payment_id}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe refund error: {str(exc)}"
            ) from exc
        except stripe.StripeError as exc:
            logger.error(f"Stripe refund failed for {payment_id}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Payment gateway refund failed: {str(exc)}"
            ) from exc

    async def cancel_payment_intent(self, payment_intent_id: str) -> dict[str, Any]:
        """
        Cancels an unpaid or pending Stripe PaymentIntent.
        """
        self._ensure_configured()
        try:
            intent = stripe.PaymentIntent.cancel(payment_intent_id)
            return {
                "id": intent.id,
                "status": intent.status,
            }
        except stripe.InvalidRequestError as exc:
            logger.warning(f"PaymentIntent '{payment_intent_id}' cancel notice: {exc}")
            return {"id": payment_intent_id, "status": "notice", "detail": str(exc)}
        except stripe.StripeError as exc:
            logger.error(f"Failed to cancel Stripe PaymentIntent '{payment_intent_id}': {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to cancel PaymentIntent: {str(exc)}"
            ) from exc


