import asyncio
import os
import sys
import time
import json
import hmac
import hashlib
from pathlib import Path

# Add project root to sys.path
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.payment.config import configure_stripe

def create_signature(payload: str, secret: str, ts: int) -> str:
    signed_payload = f"{ts}.{payload}".encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return f"t={ts},v1={sig}"

async def main():
    print("=" * 65)
    print("LIVE STRIPE WEBHOOK ENDPOINT TEST (FASTAPI ROUTER)")
    print("=" * 65)

    settings = configure_stripe()
    secret = settings.STRIPE_WEBHOOK_SECRET
    print(f"Active Webhook Secret: {secret[:12]}...{secret[-6:]}")

    test_event_id = f"evt_live_test_{int(time.time())}"
    test_pi_id = f"pi_live_test_{int(time.time())}"
    
    payload_dict = {
        "id": test_event_id,
        "object": "event",
        "api_version": "2024-06-20",
        "created": int(time.time()),
        "data": {
            "object": {
                "id": test_pi_id,
                "object": "payment_intent",
                "amount": 2500,
                "currency": "usd",
                "status": "succeeded",
                "metadata": {
                    "order_id": "99999"
                }
            }
        },
        "livemode": False,
        "type": "payment_intent.succeeded"
    }
    payload_json = json.dumps(payload_dict)
    now_ts = int(time.time())

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test 1: Valid signature request
        print("\n[Test 1] Dispatching validly signed webhook event to /api/payments/webhook:")
        valid_sig = create_signature(payload_json, secret, now_ts)
        resp1 = await client.post(
            "/api/payments/webhook",
            content=payload_json,
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": valid_sig
            }
        )
        print(f"    - Status: {resp1.status_code}")
        print(f"    - Body:   {resp1.json()}")
        assert resp1.status_code == 200, f"Expected 200, got {resp1.status_code}"
        print("    -> PASS: Webhook endpoint successfully verified and accepted the live secret!")

        # Test 2: Idempotent duplicate event
        print("\n[Test 2] Dispatching duplicate event (same event_id):")
        resp2 = await client.post(
            "/api/payments/webhook",
            content=payload_json,
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": valid_sig
            }
        )
        print(f"    - Status: {resp2.status_code}")
        print(f"    - Body:   {resp2.json()}")
        assert resp2.status_code == 200
        assert "already processed" in resp2.json().get("message", "")
        print("    -> PASS: Duplicate event cleanly caught and acknowledged idempotently!")

        # Test 3: Tampered signature rejection
        print("\n[Test 3] Dispatching event with corrupted signature:")
        bad_sig = f"t={now_ts},v1=bad_corrupted_signature_hash_000"
        resp3 = await client.post(
            "/api/payments/webhook",
            content=payload_json,
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": bad_sig
            }
        )
        print(f"    - Status: {resp3.status_code}")
        print(f"    - Detail: {resp3.json()}")
        assert resp3.status_code == 400
        print("    -> PASS: Tampered signature properly rejected with 400 Bad Request!")

    print("\n" + "=" * 65)
    print("ALL WEBHOOK ENDPOINT VERIFICATION TESTS PASSED!")
    print("=" * 65)
    return True

if __name__ == "__main__":
    success = asyncio.run(main())
    if not success:
        sys.exit(1)
