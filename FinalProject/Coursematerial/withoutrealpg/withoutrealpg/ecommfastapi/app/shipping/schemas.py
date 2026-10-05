from datetime import datetime
from pydantic import BaseModel

from app.shipping.models import ShippingStatusEnum

class ShippingAddressBase(BaseModel):
    name: str
    address_line1: str
    address_line2: str | None = None
    city: str
    state: str
    pin_code: str
    country: str

class ShippingAddressCreate(ShippingAddressBase):
    pass

class ShippingAddressUpdate(BaseModel):
    name: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    pin_code: str | None = None
    country: str | None = None

class ShippingAddressOut(ShippingAddressBase):
    id: int
    user_id: int
    model_config = {"from_attributes": True}

class ShippingStatusOut(BaseModel):
    id: int
    order_id: int
    status: ShippingStatusEnum
    updated_at: datetime
    model_config = {"from_attributes": True}

class ShippingStatusUpdate(BaseModel):
    status: ShippingStatusEnum