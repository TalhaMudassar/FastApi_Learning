from __future__ import annotations
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import ( 
    String, Text, Integer, BigInteger, Numeric, Boolean,  
    DateTime, Date, Enum, JSON, Uuid, func, ForeignKey, CheckConstraint 
) 
from datetime import datetime
from app.db.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.patients.models import Patient
    from app.doctors.models import Doctor
    from app.prescriptions.models import Prescription

class Appointment(Base):
    __tablename__ = "appointments"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id", ondelete="CASCADE"))
    appointment_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), server_default="scheduled", nullable=False)
    
    # Relationships
    # • many appointments → One patient 
    patient: Mapped["Patient"] = relationship(back_populates="appointments")

    # • many appointments → One doctor  
    doctor: Mapped["Doctor"] = relationship(back_populates="appointments") 
    
    # • One appointment → One prescription (uselist=False enforces 1-to-1 in ORM)
    prescription: Mapped["Prescription"] = relationship(
        back_populates="appointment", cascade="all, delete-orphan"
    )