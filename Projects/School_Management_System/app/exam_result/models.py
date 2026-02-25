from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey
from app.db.base import Base

if TYPE_CHECKING:
    from app.exam.models import Exam
    from app.student.models import Student
    from app.course.models import Course


class ExamResult(Base):
    __tablename__ = "exam_result"

    exam_id: Mapped[int] = mapped_column(
        ForeignKey("exam.exam_id", ondelete="CASCADE"),
        primary_key=True
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("student.student_id", ondelete="CASCADE"),
        primary_key=True
    )

    course_id: Mapped[int] = mapped_column(
        ForeignKey("course.course_id", ondelete="CASCADE"),
        primary_key=True
    )

    marks: Mapped[str] = mapped_column(String(45))

    exam: Mapped["Exam"] = relationship("Exam", back_populates="results")
    student: Mapped["Student"] = relationship("Student", back_populates="exam_results")
    course: Mapped["Course"] = relationship("Course", back_populates="exam_results")