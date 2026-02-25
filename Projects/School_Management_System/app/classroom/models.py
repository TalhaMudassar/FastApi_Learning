from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.teacher.models import Teacher
    from app.grade.models import Grade
    from app.classroom_student.models import ClassroomStudent


class Classroom(Base):
    __tablename__ = "classroom"

    classroom_id: Mapped[int] = mapped_column(primary_key=True)
    year: Mapped[int] = mapped_column(Integer)
    grade_id: Mapped[int] = mapped_column(
        ForeignKey("grade.grade_id", ondelete="CASCADE")
    )
    section: Mapped[str] = mapped_column(String(2))
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    remarks: Mapped[str] = mapped_column(String(45), nullable=True)
    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("teacher.teacher_id", ondelete="SET NULL"),
        nullable=True
    )

    teacher: Mapped["Teacher"] = relationship(
        "Teacher",
        back_populates="classrooms"
    )

    grade: Mapped["Grade"] = relationship(
        "Grade",
        back_populates="classrooms"
    )

    students: Mapped[list["ClassroomStudent"]] = relationship(
        "ClassroomStudent",
        back_populates="classroom"
    )