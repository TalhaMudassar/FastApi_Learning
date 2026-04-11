from __future__ import annotations
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import ( 
    String, Text, Integer, BigInteger, Numeric, Boolean,  
    DateTime, Date, Enum, JSON, Uuid, func, ForeignKey, CheckConstraint 
) 
from datetime import datetime
from app.db.base import Base
from typing import TYPE_CHECKING

# Avoid circular imports during runtime
if TYPE_CHECKING:
    from app.appointments.models import Appointment

class Patient(Base):
    __tablename__ = "patients"
    
    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True)
    
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int] = mapped_column(Integer, CheckConstraint("age > 0"), nullable=False)
    gender: Mapped[str] = mapped_column(String(10), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column( 
        DateTime(timezone=True), server_default=func.now() 
    )
    
    # Relationships
    # • One patient → many appointments 
    # cascade="all, delete-orphan" ensures if a patient is deleted, their ORM appointments are too
    appointments: Mapped[list["Appointment"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )