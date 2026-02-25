from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Date, ForeignKey
from app.db.base import Base

if TYPE_CHECKING:
    from app.parent.models import Parent
    from app.classroom_student.models import ClassroomStudent
    from app.exam_result.models import ExamResult
    from app.attendance.models import Attendance


class Student(Base):
    __tablename__ = "student"

    student_id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(45), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(45))
    fname: Mapped[str] = mapped_column(String(45))
    lname: Mapped[str] = mapped_column(String(45))
    dob: Mapped[date] = mapped_column(Date)
    mobile: Mapped[str] = mapped_column(String(11))
    phone: Mapped[str] = mapped_column(String(11))

    parent_id: Mapped[int] = mapped_column(
        ForeignKey("parent.parent_id", ondelete="SET NULL"),
        nullable=True
    )

    date_of_join: Mapped[date] = mapped_column(Date)
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_date: Mapped[date] = mapped_column(Date, nullable=True)
    last_login_ip: Mapped[str] = mapped_column(String(45), nullable=True)

    parent: Mapped["Parent"] = relationship("Parent", back_populates="students")

    classrooms: Mapped[list["ClassroomStudent"]] = relationship(
        "ClassroomStudent",
        back_populates="student",
        cascade="all, delete"
    )

    exam_results: Mapped[list["ExamResult"]] = relationship(
        "ExamResult",
        back_populates="student"
    )

    attendance_records: Mapped[list["Attendance"]] = relationship(
        "Attendance",
        back_populates="student"
    )