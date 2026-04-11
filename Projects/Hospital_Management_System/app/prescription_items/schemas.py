from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class PrescriptionItemBase(BaseModel):
    prescription_id: int = Field(gt=0)
    medicine_id: int = Field(gt=0)
    dosage: str = Field(min_length=1, max_length=50, examples=["2 pills"])
    duration: str = Field(min_length=1, max_length=50, examples=["5 days"])

class PrescriptionItemCreate(PrescriptionItemBase):
    pass

class PrescriptionItemUpdate(PrescriptionItemBase):
    pass

class PrescriptionItemPatch(BaseModel):
    prescription_id: Optional[int] = Field(None, gt=0)
    medicine_id: Optional[int] = Field(None, gt=0)
    dosage: Optional[str] = Field(None, min_length=1, max_length=50)
    duration: Optional[str] = Field(None, min_length=1, max_length=50)

class PrescriptionItemOut(PrescriptionItemBase):
    id: int

    model_config = ConfigDict(from_attributes=True)