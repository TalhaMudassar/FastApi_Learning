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
    from app.appointments.models import Appointment
    from app.prescription_items.models import PrescriptionItem

class Prescription(Base):
    __tablename__ = "prescriptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    # unique=True enforces the 1-to-1 relationship at the database level
    appointment_id: Mapped[int] = mapped_column(
        ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    doctor_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    # • One prescription → One appointment
    appointment: Mapped["Appointment"] = relationship(back_populates="prescription")

    # • One prescription → Many prescription items
    items: Mapped[list["PrescriptionItem"]] = relationship(
        back_populates="prescription", cascade="all, delete-orphan"
    )