"""
CLI Test Tool for Local Stripe Webhook Signing & Dispatch.
Constructs cryptographically signed Stripe webhook events using HMAC-SHA256
and posts them to the local FastAPI webhook endpoint.
"""

import argparse
import hashlib
import hmac
import json
import os
import sys
import time
from pathlib import Path

# Add project root to sys.path so we can read config if needed
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

try:
    import requests
except ImportError:
    print("Error: 'requests' library is required. Install with 'pip install requests'.")
    sys.exit(1)


def get_default_secret() -> str:
    env_file = project_root / ".env"
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("STRIPE_WEBHOOK_SECRET="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return "whsec_test_secret_for_local_mock_123"


def generate_stripe_signature(payload: str, secret: str, timestamp: int | None = None) -> tuple[str, int]:
    """Generates the Stripe-Signature header format: t={timestamp},v1={hmac_hex}."""
    ts = timestamp if timestamp is not None else int(time.time())
    signed_payload = f"{ts}.{payload}".encode("utf-8")
    signature = hmac.new(
        secret.encode("utf-8"),
        signed_payload,
        hashlib.sha256
    ).hexdigest()
    return f"t={ts},v1={signature}", ts


def build_event_payload(
    event_type: str,
    event_id: str,
    payment_intent_id: str,
    order_id: int,
    amount: float,
    currency: str,
    error_message: str | None = None
) -> dict:
    amount_cents = int(round(amount * 100))
    status_str = "succeeded" if event_type == "payment_intent.succeeded" else "requires_payment_method"

    data_object = {
        "id": payment_intent_id,
        "object": "payment_intent",
        "amount": amount_cents,
        "amount_received": amount_cents if event_type == "payment_intent.succeeded" else 0,
        "currency": currency.lower(),
        "status": status_str,
        "latest_charge": f"ch_mock_{int(time.time())}",
        "metadata": {
            "order_id": str(order_id)
        }
    }

    if event_type == "payment_intent.payment_failed":
        data_object["last_payment_error"] = {
            "code": "card_declined",
            "message": error_message or "Your card was declined."
        }

    return {
        "id": event_id,
        "object": "event",
        "api_version": "2024-06-20",
        "created": int(time.time()),
        "data": {
            "object": data_object
        },
        "livemode": False,
        "type": event_type
    }


def send_webhook(
    url: str,
    secret: str,
    event_type: str,
    order_id: int,
    payment_intent_id: str | None,
    amount: float,
    currency: str,
    corrupt_signature: bool = False,
    custom_event_id: str | None = None,
    error_message: str | None = None
):
    ts = int(time.time())
    event_id = custom_event_id or f"evt_test_{ts}"
    pi_id = payment_intent_id or f"pi_test_{ts}"

    payload_dict = build_event_payload(
        event_type=event_type,
        event_id=event_id,
        payment_intent_id=pi_id,
        order_id=order_id,
        amount=amount,
        currency=currency,
        error_message=error_message
    )
    payload_json = json.dumps(payload_dict)

    if corrupt_signature:
        sig_header = f"t={ts},v1=bad_invalid_signature_hash_000000000000"
    else:
        sig_header, _ = generate_stripe_signature(payload_json, secret, timestamp=ts)

    headers = {
        "Content-Type": "application/json",
        "Stripe-Signature": sig_header
    }

    print(f"\n--- Sending Local Webhook Event ---")
    print(f"Target URL:        {url}")
    print(f"Event ID:          {event_id}")
    print(f"Event Type:        {event_type}")
    print(f"Order ID:          {order_id}")
    print(f"PaymentIntent ID:  {pi_id}")
    print(f"Stripe-Signature:  {sig_header[:40]}...")
    print(f"Corrupt Signature: {corrupt_signature}")

    try:
        response = requests.post(url, data=payload_json, headers=headers, timeout=10)
        print(f"\nResponse Code:     {response.status_code}")
        print(f"Response Body:     {response.text}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"\nFailed to connect to server: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Stripe Local Webhook Test Signer")
    parser.add_argument("--url", default="http://localhost:8000/api/payments/webhook", help="Webhook endpoint URL")
    parser.add_argument("--secret", default=get_default_secret(), help="Stripe webhook signing secret")
    parser.add_argument("--event-type", choices=["payment_intent.succeeded", "payment_intent.payment_failed"], default="payment_intent.succeeded", help="Stripe event type")
    parser.add_argument("--order-id", type=int, default=1, help="Target Order ID")
    parser.add_argument("--payment-intent-id", default=None, help="Target PaymentIntent ID (pi_...)")
    parser.add_argument("--amount", type=float, default=200.0, help="Amount in standard currency units (e.g. 200.0)")
    parser.add_argument("--currency", default="usd", help="Currency code")
    parser.add_argument("--event-id", default=None, help="Custom Event ID (evt_...)")
    parser.add_argument("--error-msg", default="Your card was declined.", help="Failure message for payment_failed event")
    parser.add_argument("--fail-signature", action="store_true", help="Send deliberately invalid signature to test rejection")

    args = parser.parse_args()

    send_webhook(
        url=args.url,
        secret=args.secret,
        event_type=args.event_type,
        order_id=args.order_id,
        payment_intent_id=args.payment_intent_id,
        amount=args.amount,
        currency=args.currency,
        corrupt_signature=args.fail_signature,
        custom_event_id=args.event_id,
        error_message=args.error_msg
    )


if __name__ == "__main__":
    main()
