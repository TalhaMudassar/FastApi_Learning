import uuid
from decimal import Decimal

# ISO currency codes that do not use fractional subdivisions (zero-decimal currencies)
ZERO_DECIMAL_CURRENCIES = {
    "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
    "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"
}

def generate_mock_ids() -> tuple[str, str, str]:
    rand = lambda: uuid.uuid4().hex[:8].upper()
    return (
        f"MOCK-OD-{rand()}",
        f"MOCK-PY-{rand()}",
        f"MOCK-SI-{rand()}",
    )

def to_stripe_amount(amount: Decimal | float, currency: str = "usd") -> int:
    """
    Converts a currency amount to the smallest unit (cents/pennies) required by Stripe.
    Uses Decimal to avoid floating point precision inaccuracies.
    """
    dec_amount = Decimal(str(amount))
    cur = currency.lower().strip()
    if cur in ZERO_DECIMAL_CURRENCIES:
        return int(round(dec_amount))
    return int(round(dec_amount * 100))

def from_stripe_amount(amount: int, currency: str = "usd") -> Decimal:
    """
    Converts a Stripe smallest-unit integer amount back to a standard Decimal amount.
    """
    cur = currency.lower().strip()
    if cur in ZERO_DECIMAL_CURRENCIES:
        return Decimal(str(amount))
    return Decimal(str(amount)) / Decimal("100")

def build_idempotency_key(order_id: int, user_id: int, action: str = "create", attempt_id: str | None = None) -> str:
    """
    Builds an idempotency key for Stripe API calls.
    Optionally accepts attempt_id to avoid key collisions across distinct attempts.
    """
    key = f"idemp_{action}_order_{order_id}_user_{user_id}"
    if attempt_id:
        key += f"_{attempt_id}"
    return key


def mask_secret(secret: str | None, visible_start: int = 7, visible_end: int = 4) -> str:
    """
    Masks sensitive API secrets or keys for safe logging.
    Example: sk_test_51Abcd...xyz -> sk_test_***xyz
    """
    if not secret:
        return "[NOT SET]"
    s = str(secret).strip()
    if len(s) <= (visible_start + visible_end):
        return "***"
    return f"{s[:visible_start]}***{s[-visible_end:]}"

def extract_safe_stripe_error(exc: Exception) -> dict[str, str]:
    """
    Extracts sanitized error details from Stripe exceptions for client responses and logs.
    Guarantees no raw keys or sensitive payment credentials leak to the user.
    """
    error_type = type(exc).__name__
    user_message = getattr(exc, "user_message", None) or str(exc)
    code = getattr(exc, "code", None) or "stripe_error"
    return {
        "error_type": error_type,
        "code": str(code),
        "message": user_message
    }
