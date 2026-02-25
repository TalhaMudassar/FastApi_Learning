from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Date
from app.db.base import Base

if TYPE_CHECKING:
    from app.student.models import Student


class Parent(Base):
    __tablename__ = "parent"

    parent_id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(45), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(45))
    fname: Mapped[str] = mapped_column(String(45))
    lname: Mapped[str] = mapped_column(String(45))
    dob: Mapped[date] = mapped_column(Date)
    mobile: Mapped[str] = mapped_column(String(11))
    phone: Mapped[str] = mapped_column(String(11))
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_date: Mapped[date] = mapped_column(Date, nullable=True)
    last_login_ip: Mapped[str] = mapped_column(String(45), nullable=True)

    students: Mapped[list["Student"]] = relationship(
        "Student",
        back_populates="parent",
        cascade="all, delete"
    )