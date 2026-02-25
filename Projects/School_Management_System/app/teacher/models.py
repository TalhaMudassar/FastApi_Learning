from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Date
from app.db.base import Base

if TYPE_CHECKING:
    from app.classroom.models import Classroom


class Teacher(Base):
    __tablename__ = "teacher"

    teacher_id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(45), unique=True)
    password: Mapped[str] = mapped_column(String(45))
    fname: Mapped[str] = mapped_column(String(45))
    lname: Mapped[str] = mapped_column(String(45))
    dob: Mapped[date] = mapped_column(Date)
    mobile: Mapped[str] = mapped_column(String(11))
    phone: Mapped[str] = mapped_column(String(11))
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_date: Mapped[date] = mapped_column(Date, nullable=True)
    last_login_ip: Mapped[str] = mapped_column(String(45), nullable=True)

    classrooms: Mapped[list["Classroom"]] = relationship(
        "Classroom",
        back_populates="teacher"
    )