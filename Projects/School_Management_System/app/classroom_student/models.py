from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from app.db.base import Base

if TYPE_CHECKING:
    from app.student.models import Student
    from app.classroom.models import Classroom


class ClassroomStudent(Base):
    __tablename__ = "classroom_student"

    classroom_id: Mapped[int] = mapped_column(
        ForeignKey("classroom.classroom_id", ondelete="CASCADE"),
        primary_key=True
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("student.student_id", ondelete="CASCADE"),
        primary_key=True
    )

    classroom: Mapped["Classroom"] = relationship(
        "Classroom",
        back_populates="students"
    )

    student: Mapped["Student"] = relationship(
        "Student",
        back_populates="classrooms"
    )