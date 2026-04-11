from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class MedicineBase(BaseModel):
    name: str = Field(min_length=2, max_length=100, examples=["Paracetamol"])
    price: float = Field(ge=0, description="Price of the medicine", examples=[10.50])
    stock_quantity: int = Field(ge=0, description="Number of items in stock", examples=[150])

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(MedicineBase):
    pass

class MedicinePatch(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    price: Optional[float] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)

class MedicineOut(MedicineBase):
    id: int

    model_config = ConfigDict(from_attributes=True)