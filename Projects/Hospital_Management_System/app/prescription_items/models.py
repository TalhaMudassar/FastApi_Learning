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
    from app.prescriptions.models import Prescription
    from app.medicines.models import Medicine

# 🚨 CHANGED: Prescription_item is now PrescriptionItem
class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    
    # Foreign Keys bridging Prescriptions and Medicines
    prescription_id: Mapped[int] = mapped_column(
        ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False
    )
    medicine_id: Mapped[int] = mapped_column(
        ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False
    )
    
    dosage: Mapped[str] = mapped_column(String(50), nullable=False)
    duration: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relationships
    # • Many items → One prescription
    prescription: Mapped["Prescription"] = relationship(back_populates="items")
    
    # • Many items → One medicine
    medicine: Mapped["Medicine"] = relationship(back_populates="prescription_items")