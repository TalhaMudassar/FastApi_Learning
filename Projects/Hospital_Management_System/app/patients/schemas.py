from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime

# ===============================
# Base
# ===============================
class PatientBase(BaseModel):
    name: str = Field( 
        min_length=3, 
        max_length=100, # Increased to match your DB VARCHAR(100)
        description="Full name of the patient", 
        examples=["John Doe"] 
    ) 
    age: int = Field( 
        gt=0, 
        lt=120, 
        description="Patient age", 
        examples=[25] 
    )
    gender: Literal["Male", "Female", "Other"] = Field(
        description="Gender of the patient", 
        examples=["Male"] 
    )
    phone: str = Field( 
        pattern=r"^\+?[0-9]{10,20}$", # Allows 10-20 digits, optional +
        description="Phone number (10-20 digits)", 
        examples=["+1234567890"] 
    )
    address: Optional[str] = Field(
        default=None,
        description="Home Address", 
        examples=["123 Main St, City"] 
    )

# ===============================
# Create & Update
# ===============================
class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    pass

# ===============================
# Patch (Partial Update)
# ===============================
class PatientPatch(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    age: Optional[int] = Field(None, gt=0, lt=120)
    gender: Optional[Literal["Male", "Female", "Other"]] = None
    phone: Optional[str] = Field(None, pattern=r"^\+?[0-9]{10,20}$")
    address: Optional[str] = None

# ===============================
# Response (Out)
# ===============================
class PatientOut(PatientBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)