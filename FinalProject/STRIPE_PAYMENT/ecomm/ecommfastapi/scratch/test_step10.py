import sys
from pathlib import Path
from decimal import Decimal
import asyncio
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import HTTPException
import stripe

from app.payment.config import configure_stripe
from app.payment.utils import mask_secret, extract_safe_stripe_error
from app.payment.gateways.stripe import StripePaymentGateway

async def run_step10_tests():
    print("\n--- Test 1: Secrets Masking Utility ---")
    raw_secret = "sk_test_51Abcd1234567890xyz"
    raw_wh = "whsec_abcdef1234567890ghijk"
    masked_s = mask_secret(raw_secret)
    masked_w = mask_secret(raw_wh)
    print(f"Original: {raw_secret} -> Masked: {masked_s}")
    print(f"Original: {raw_wh} -> Masked: {masked_w}")
    assert "***" in masked_s and not ("1234567890" in masked_s)
    assert "***" in masked_w and not ("1234567890" in masked_w)
    assert mask_secret(None) == "[NOT SET]"
    print("Secrets masking verified!")

    print("\n--- Test 2: Safe Stripe Settings Summary ---")
    settings = configure_stripe()
    summary = settings.safe_summary()
    print("Settings safe summary:", summary)
    assert "***" in summary["STRIPE_SECRET_KEY"]
    assert "***" in summary["STRIPE_WEBHOOK_SECRET"]
    print("Safe settings summary verified!")

    gateway = StripePaymentGateway(settings)

    print("\n--- Test 3: CardError Exception Mapping ---")
    mock_card_err = stripe.CardError(
        message="Your card has expired.",
        param="exp_month",
        code="expired_card",
        http_status=402
    )
    with patch("stripe.PaymentIntent.create", side_effect=mock_card_err):
        try:
            await gateway.create_payment(amount=100.0, order_id=999, user_id=1)
            assert False, "Should have raised HTTPException"
        except HTTPException as exc:
            print("Caught CardError HTTP status:", exc.status_code, "detail:", exc.detail)
            assert exc.status_code == 400
            assert "expired_card" in exc.detail

    print("\n--- Test 4: RateLimitError Exception Mapping ---")
    mock_rate_err = stripe.RateLimitError(message="Too many requests", http_status=429)
    with patch("stripe.PaymentIntent.create", side_effect=mock_rate_err):
        try:
            await gateway.create_payment(amount=100.0, order_id=999, user_id=1)
            assert False, "Should have raised HTTPException"
        except HTTPException as exc:
            print("Caught RateLimitError HTTP status:", exc.status_code, "detail:", exc.detail)
            assert exc.status_code == 429
            assert "rate limit" in exc.detail.lower()

    print("\n--- Test 5: APIConnectionError Exception Mapping ---")
    mock_conn_err = stripe.APIConnectionError(message="Failed to connect to stripe-mock")
    with patch("stripe.PaymentIntent.create", side_effect=mock_conn_err):
        try:
            await gateway.create_payment(amount=100.0, order_id=999, user_id=1)
            assert False, "Should have raised HTTPException"
        except HTTPException as exc:
            print("Caught APIConnectionError HTTP status:", exc.status_code, "detail:", exc.detail)
            assert exc.status_code == 503
            assert "unreachable" in exc.detail.lower()

    print("\n--- Test 6: AuthenticationError Exception Mapping ---")
    mock_auth_err = stripe.AuthenticationError(message="Invalid API Key provided", http_status=401)
    with patch("stripe.PaymentIntent.create", side_effect=mock_auth_err):
        try:
            await gateway.create_payment(amount=100.0, order_id=999, user_id=1)
            assert False, "Should have raised HTTPException"
        except HTTPException as exc:
            print("Caught AuthenticationError HTTP status:", exc.status_code, "detail:", exc.detail)
            assert exc.status_code == 500
            assert "configuration error" in exc.detail.lower()

    print("\n--- Test 7: retrieve_payment_intent 404 on Missing Intent ---")
    mock_missing_err = stripe.InvalidRequestError(message="No such payment_intent: pi_nonexistent", param="id", http_status=404)
    with patch("stripe.PaymentIntent.retrieve", side_effect=mock_missing_err):
        try:
            await gateway.retrieve_payment_intent("pi_nonexistent")
            assert False, "Should have raised HTTPException"
        except HTTPException as exc:
            print("Caught InvalidRequestError HTTP status:", exc.status_code, "detail:", exc.detail)
            assert exc.status_code == 404
            assert "not found" in exc.detail.lower()

    print("\nALL STEP 10 ERROR HANDLING & LOGGING CLEANUP TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_step10_tests())
