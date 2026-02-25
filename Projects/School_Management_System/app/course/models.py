from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey
from app.db.base import Base

if TYPE_CHECKING:
    from app.grade.models import Grade
    from app.exam_result.models import ExamResult


class Course(Base):
    __tablename__ = "course"

    course_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(45))
    description: Mapped[str] = mapped_column(String(100), nullable=True)

    grade_id: Mapped[int] = mapped_column(
        ForeignKey("grade.grade_id", ondelete="CASCADE")
    )

    grade: Mapped["Grade"] = relationship("Grade", back_populates="courses")

    exam_results: Mapped[list["ExamResult"]] = relationship(
        "ExamResult",
        back_populates="course"
    )