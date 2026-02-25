from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Date, Boolean, Text, ForeignKey
from app.db.base import Base

if TYPE_CHECKING:
    from app.student.models import Student


class Attendance(Base):
    __tablename__ = "attendance"

    date: Mapped[date] = mapped_column(Date, primary_key=True)

    student_id: Mapped[int] = mapped_column(
        ForeignKey("student.student_id", ondelete="CASCADE"),
        primary_key=True
    )

    status: Mapped[bool] = mapped_column(Boolean)
    remark: Mapped[str] = mapped_column(Text, nullable=True)

    student: Mapped["Student"] = relationship(
        "Student",
        back_populates="attendance_records"
    )