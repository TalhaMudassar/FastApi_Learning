from typing import Literal
from pydantic import BaseModel, Field
from app.payment.models import PaymentGatewayEnum

class PaymentCreate(BaseModel):
    amount: float
    shipping_address_id: int
    gateway: Literal["mock", "razorpay"] = Field(default="mock")
    simulate_success: bool = True

class PaymentOut(BaseModel):
    id: int
    order_id: int
    amount: float
    status: str
    is_paid: bool
    payment_gateway: PaymentGatewayEnum

    model_config = {
        "from_attributes": True
    }