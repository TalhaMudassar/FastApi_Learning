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
    from app.prescription_items.models import PrescriptionItem

class Medicine(Base):
    __tablename__ = "medicines"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Numeric is the equivalent of DECIMAL. Added CheckConstraint for price >= 0
    price: Mapped[float] = mapped_column(
        Numeric(10, 2), CheckConstraint("price >= 0"), nullable=False
    )
    # Added CheckConstraint for stock >= 0
    stock_quantity: Mapped[int] = mapped_column(
        Integer, CheckConstraint("stock_quantity >= 0"), server_default="0", nullable=False
    )

    # Relationships
    # • One medicine → Many prescription items
    prescription_items: Mapped[list["PrescriptionItem"]] = relationship(
        back_populates="medicine"
    )