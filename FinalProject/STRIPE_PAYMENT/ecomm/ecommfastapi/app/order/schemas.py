from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.shipping.schemas import ShippingAddressOut, ShippingStatusOut
from app.payment.schemas import PaymentOut

class OrderedProductInfo(BaseModel):
    title: str
    description: str | None = None
    
    model_config = {"from_attributes": True}

class OrderItemOut(BaseModel):
    id: int
    product_id: int | None
    quantity: int
    price: float
    product: OrderedProductInfo | None = None
    
    model_config = {"from_attributes": True}

class OrderOut(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: datetime
    shipping_address: ShippingAddressOut
    shipping_status: Optional[ShippingStatusOut] = None
    orderitems: list[OrderItemOut]
    payment: Optional[PaymentOut] = None
    
    model_config = {"from_attributes": True}