from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Date, ForeignKey
from app.db.base import Base

if TYPE_CHECKING:
    from app.exam_type.models import ExamType
    from app.exam_result.models import ExamResult


class Exam(Base):
    __tablename__ = "exam"

    exam_id: Mapped[int] = mapped_column(primary_key=True)
    exam_type_id: Mapped[int] = mapped_column(
        ForeignKey("exam_type.exam_type_id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(45))
    start_date: Mapped[date] = mapped_column(Date)

    exam_type: Mapped["ExamType"] = relationship(
        "ExamType",
        back_populates="exams"
    )

    results: Mapped[list["ExamResult"]] = relationship(
        "ExamResult",
        back_populates="exam"
    )