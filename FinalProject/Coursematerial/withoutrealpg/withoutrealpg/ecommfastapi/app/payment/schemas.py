from pydantic import BaseModel, Field
from typing import Literal

from app.payment.models import PaymentGatewayEnum

class PaymentCreate(BaseModel):
  amount: int
  shipping_address_id: int
  gateway: Literal["mock", "razorpay"] = Field(default="mock")
  simulate_success: bool | None = None

class PaymentOut(BaseModel):
  id: int
  order_id: int
  amount: int
  status: str
  is_paid: bool
  payment_gateway: PaymentGatewayEnum
  model_config = {
        "from_attributes": True
    }