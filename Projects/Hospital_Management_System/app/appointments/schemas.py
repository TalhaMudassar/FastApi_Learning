from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime

class AppointmentBase(BaseModel):
    patient_id: int = Field(gt=0, description="ID of the patient")
    doctor_id: int = Field(gt=0, description="ID of the doctor")
    appointment_date: datetime = Field(description="Scheduled date and time")
    status: Literal["scheduled", "completed", "cancelled"] = Field(
        default="scheduled", description="Current status of the appointment"
    )

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(AppointmentBase):
    pass

class AppointmentPatch(BaseModel):
    patient_id: Optional[int] = Field(None, gt=0)
    doctor_id: Optional[int] = Field(None, gt=0)
    appointment_date: Optional[datetime] = None
    status: Optional[Literal["scheduled", "completed", "cancelled"]] = None

class AppointmentOut(AppointmentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)