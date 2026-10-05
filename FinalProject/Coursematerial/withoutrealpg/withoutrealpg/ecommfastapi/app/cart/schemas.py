from pydantic import BaseModel

class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemOut(BaseModel):
    id: int
    user_id: int
    product_id: int
    product_title: str
    quantity: int
    price: float
    total: float
    model_config = {
        "from_attributes": True
    }

class CartSummary(BaseModel):
    items: list[CartItemOut]
    total_quantity: int
    total_price: float