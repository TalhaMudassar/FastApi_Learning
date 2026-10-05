import asyncio
import os
import sys
import time
from pathlib import Path
from decimal import Decimal

# Ensure project root is on sys.path
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from app.payment.config import configure_stripe
from app.payment.gateways.stripe import StripePaymentGateway
import stripe

async def main():
    print("=" * 65)
    print("LIVE STRIPE CLOUD INTEGRATION SMOKE TEST")
    print("=" * 65)

    # Step 1: Verify Configuration
    settings = configure_stripe()
    print(f"\n[1] Verifying Stripe Credentials & SDK Configuration:")
    print(f"    - Public Key:     {settings.STRIPE_PUBLISHABLE_KEY[:14]}...{settings.STRIPE_PUBLISHABLE_KEY[-6:]}")
    print(f"    - Secret Key:     {settings.STRIPE_SECRET_KEY[:14]}...{settings.STRIPE_SECRET_KEY[-6:]}")
    print(f"    - Webhook Secret: {settings.STRIPE_WEBHOOK_SECRET[:12]}...{settings.STRIPE_WEBHOOK_SECRET[-6:]}")
    print(f"    - Target API:     {settings.STRIPE_API_BASE or 'https://api.stripe.com (Default Live Cloud)'}")
    print(f"    - Currency:       {settings.STRIPE_CURRENCY}")

    # Check Account Details
    stripe.api_key = settings.STRIPE_SECRET_KEY
    if settings.STRIPE_API_BASE and settings.STRIPE_API_BASE.strip():
        stripe.api_base = settings.STRIPE_API_BASE.strip()
    else:
        stripe.api_base = "https://api.stripe.com"

    try:
        account_res = stripe.Account.retrieve()
        account = account_res.to_dict() if hasattr(account_res, "to_dict") else dict(account_res)
        acct_id = account.get("id")
        acct_name = account.get("business_profile", {}).get("name") or account.get("settings", {}).get("dashboard", {}).get("display_name") or "Sandbox Account"
        charges_enabled = account.get("charges_enabled", False)
        print(f"\n[2] Connected to Stripe Cloud Account:")
        print(f"    - Account ID:      {acct_id}")
        print(f"    - Account Name:    {acct_name}")
        print(f"    - Charges Enabled: {charges_enabled}")
    except Exception as exc:
        print(f"\n[!] Failed to connect to Stripe Account: {exc}")
        return False

    # Step 2: Create Live Test PaymentIntent via StripePaymentGateway
    gateway = StripePaymentGateway(settings)
    test_order_id = 999
    test_user_id = 1
    test_amount = Decimal("25.00")

    print(f"\n[3] Creating Live Test PaymentIntent via StripePaymentGateway:")
    print(f"    - Order ID: {test_order_id}")
    print(f"    - Amount:   ${test_amount} USD")

    try:
        result = await gateway.create_payment(
            amount=test_amount,
            order_id=test_order_id,
            user_id=test_user_id,
            currency="usd",
            metadata={"test_run": "antigravity_live_smoke_test"}
        )
        pi_id = result.pg_order_id
        client_secret = result.client_secret
        print(f"    -> Status:          {result.status}")
        print(f"    -> PaymentIntent ID: {pi_id}")
        print(f"    -> Client Secret:   {client_secret[:20]}... (len={len(client_secret)})")
        print(f"    -> Raw Status:      {result.raw_response.get('status')}")
    except Exception as exc:
        print(f"\n[!] PaymentIntent creation failed: {exc}")
        import traceback
        traceback.print_exc()
        return False

    # Step 3: Fetch the created PaymentIntent directly from Stripe Cloud API to verify persistence
    print(f"\n[4] Querying Stripe Cloud API to verify PaymentIntent persistence:")
    try:
        fetched_pi = stripe.PaymentIntent.retrieve(pi_id)
        pi_dict = fetched_pi.to_dict() if hasattr(fetched_pi, "to_dict") else dict(fetched_pi)
        metadata = pi_dict.get("metadata", {})
        print(f"    - Verified ID:       {fetched_pi.id}")
        print(f"    - Amount in Cents:   {fetched_pi.amount} ({fetched_pi.currency.upper()})")
        print(f"    - Live Intent Status: {fetched_pi.status}")
        print(f"    - Order ID Metadata: {metadata.get('order_id')}")
        print(f"    - Automatic Methods: {fetched_pi.automatic_payment_methods.enabled}")
        print(f"    -> Confirmation: Visible in Stripe Dashboard under 'Payments'!")
    except Exception as exc:
        print(f"\n[!] Failed to retrieve PaymentIntent from Stripe: {exc}")
        return False

    # Step 4: Webhook Signature Verification Smoke Test
    print(f"\n[5] Testing Webhook Signature Verification with Live Secret:")
    import json
    payload_dict = {
        "id": f"evt_smoke_test_{int(time.time())}",
        "object": "event",
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": pi_id,
                "object": "payment_intent",
                "status": "succeeded",
                "metadata": {"order_id": str(test_order_id)}
            }
        }
    }
    payload = json.dumps(payload_dict)
    import hmac
    import hashlib
    now_ts = int(time.time())
    signed_payload = f"{now_ts}.{payload}".encode("utf-8")
    expected_sig = hmac.new(
        settings.STRIPE_WEBHOOK_SECRET.encode("utf-8"),
        signed_payload,
        hashlib.sha256
    ).hexdigest()
    sig_header = f"t={now_ts},v1={expected_sig}"
    print(f"    - Generated Header: {sig_header[:45]}...")

    # Test Valid Signature Parsing
    try:
        verified_event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=settings.STRIPE_WEBHOOK_SECRET
        )
        evt_id = getattr(verified_event, "id", None) or (verified_event.to_dict().get("id") if hasattr(verified_event, "to_dict") else "verified")
        print(f"    - Valid Signature Verification: PASS (Event ID: {evt_id})")
    except Exception as exc:
        print(f"    - Valid Signature Verification: FAIL ({exc})")
        return False

    # Test Corrupted Signature Rejection
    bad_sig = f"t={now_ts},v1=bad_hex_signature_should_fail_123456789"
    try:
        stripe.Webhook.construct_event(
            payload=payload,
            sig_header=bad_sig,
            secret=settings.STRIPE_WEBHOOK_SECRET
        )
        print(f"    - Invalid Signature Rejection: FAIL (Should have raised error)")
        return False
    except stripe.SignatureVerificationError:
        print(f"    - Invalid Signature Rejection: PASS (Correctly rejected SignatureVerificationError)")

    print("\n" + "=" * 65)
    print("ALL LIVE STRIPE BACKEND SMOKE TESTS PASSED!")
    print("=" * 65)
    return True

if __name__ == "__main__":
    success = asyncio.run(main())
    if not success:
        sys.exit(1)
