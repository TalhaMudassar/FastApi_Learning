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
    
class Doctor(Base):
    __tablename__  = "doctors"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    specialization: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column( 
        DateTime(timezone=True),  
        server_default=func.now()
    ) 
    
    # Relationships
    # • One doctor → many appointments 
    appointments: Mapped[list["Appointment"]] = relationship(
        back_populates="doctor", cascade="all, delete-orphan"
    )