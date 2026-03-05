from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, ForeignKey, DateTime, Text
from app.db.base import Base
from datetime import datetime

if TYPE_CHECKING:
    from app.users.models import Users
    from app.tasks.models import Tasks


class Comments(Base):
    __tablename__ = "comments"

    comment_id: Mapped[int] = mapped_column(Integer, primary_key=True)

    content: Mapped[str] = mapped_column(Text, nullable=False)

    task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.task_id", ondelete="CASCADE"),
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    
    # Many comments → One task
    task: Mapped["Tasks"] = relationship(back_populates="comments")
    # Many comments → One user
    user: Mapped["Users"] = relationship(back_populates="comments")
  
