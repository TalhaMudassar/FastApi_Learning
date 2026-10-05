from typing import Literal
from pydantic import BaseModel, Field
from app.payment.models import PaymentGatewayEnum

class PaymentCreate(BaseModel):
    amount: float
    shipping_address_id: int
    gateway: Literal["mock", "stripe"] = Field(default="mock")
    simulate_success: bool = True

class PaymentOut(BaseModel):
    id: int
    order_id: int
    amount: float
    status: str
    is_paid: bool
    payment_gateway: PaymentGatewayEnum
    pg_order_id: str | None = None
    client_secret: str | None = None

    model_config = {
        "from_attributes": True
    }

class PaymentIntentCreateRequest(BaseModel):
    currency: str = Field(default="usd", description="Payment currency ISO code")

class PaymentIntentResponse(BaseModel):
    order_id: int
    payment_id: int
    payment_intent_id: str
    client_secret: str
    amount: float
    currency: str
    status: str
    publishable_key: str

class PaymentStatusResponse(BaseModel):
    order_id: int
    payment_id: int
    amount: float
    status: str
    is_paid: bool
    payment_gateway: str
    pg_order_id: str | None = None
    gateway_status: str | None = None
    order_status: str