from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.shipping.schemas import ShippingAddressOut, ShippingStatusOut

class OrderedProductInfo(BaseModel):
  title: str
  description:str 
  model_config = {"from_attributes": True}
  

class OrderItemOut(BaseModel):
  id: int
  product_id: int | None
  quantity: int
  price: float
  product: OrderedProductInfo | None
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
  model_config = {"from_attributes": True}
  