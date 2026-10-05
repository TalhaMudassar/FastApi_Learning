import os
from functools import lru_cache
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import stripe

class StripeSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    STRIPE_SECRET_KEY: str = Field(..., description="Stripe secret API key")
    STRIPE_PUBLISHABLE_KEY: str = Field(..., description="Stripe publishable API key")
    STRIPE_WEBHOOK_SECRET: str = Field(..., description="Stripe webhook signing secret")
    STRIPE_API_BASE: str | None = Field(default=None, description="Optional Stripe API base URL (defaults to https://api.stripe.com)")
    STRIPE_CURRENCY: str = Field(default="usd", description="Payment currency in ISO format (e.g. usd, pkr, eur)")


    @field_validator("STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET")
    @classmethod
    def validate_non_empty(cls, v: str, info) -> str:
        if not v or not v.strip():
            raise ValueError(f"Missing required Stripe setting: {info.field_name}. Please set it in your .env file.")
        return v.strip()

    @field_validator("STRIPE_CURRENCY")
    @classmethod
    def normalize_currency(cls, v: str) -> str:
        if not v or not v.strip():
            return "usd"
        return v.strip().lower()

    def safe_summary(self) -> dict[str, str]:
        """Returns non-sensitive configuration with masked secret credentials."""
        from app.payment.utils import mask_secret
        return {
            "STRIPE_API_BASE": self.STRIPE_API_BASE,
            "STRIPE_CURRENCY": self.STRIPE_CURRENCY,
            "STRIPE_SECRET_KEY": mask_secret(self.STRIPE_SECRET_KEY),
            "STRIPE_PUBLISHABLE_KEY": mask_secret(self.STRIPE_PUBLISHABLE_KEY),
            "STRIPE_WEBHOOK_SECRET": mask_secret(self.STRIPE_WEBHOOK_SECRET),
        }


@lru_cache()
def get_stripe_settings() -> StripeSettings:
    """
    Returns a cached StripeSettings instance.
    Fails fast with a clean error message if required environment variables are missing.
    """
    try:
        return StripeSettings()
    except Exception as exc:
        raise RuntimeError(
            f"Stripe configuration error: {exc}. Ensure STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, "
            f"and STRIPE_WEBHOOK_SECRET are defined in your .env file."
        ) from exc

def configure_stripe() -> StripeSettings:
    """
    Applies the settings to the global stripe SDK module.
    """
    settings = get_stripe_settings()
    stripe.api_key = settings.STRIPE_SECRET_KEY
    if settings.STRIPE_API_BASE and settings.STRIPE_API_BASE.strip():
        stripe.api_base = settings.STRIPE_API_BASE.strip()
    else:
        stripe.api_base = "https://api.stripe.com"
    return settings

