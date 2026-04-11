from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class PrescriptionBase(BaseModel):
    appointment_id: int = Field(gt=0, description="ID of the related appointment")
    doctor_notes: Optional[str] = Field(None, description="Notes written by the doctor")

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionUpdate(PrescriptionBase):
    pass

class PrescriptionPatch(BaseModel):
    appointment_id: Optional[int] = Field(None, gt=0)
    doctor_notes: Optional[str] = None

class PrescriptionOut(PrescriptionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)