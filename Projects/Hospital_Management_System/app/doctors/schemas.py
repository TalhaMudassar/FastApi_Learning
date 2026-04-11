from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class DoctorBase(BaseModel):
    name: str = Field(min_length=3, max_length=100, examples=["Dr. Jane Smith"])
    specialization: str = Field(min_length=2, max_length=100, examples=["Cardiology"])
    email: EmailStr = Field(description="Unique email address", examples=["jane.smith@hospital.com"])
    phone: str = Field(pattern=r"^\+?[0-9]{10,20}$", examples=["+1987654321"])

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(DoctorBase):
    pass

class DoctorPatch(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    specialization: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern=r"^\+?[0-9]{10,20}$")

class DoctorOut(DoctorBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)