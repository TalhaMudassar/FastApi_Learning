from __future__ import annotations
from typing import TYPE_CHECKING, List
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, DateTime
from app.db.base import Base
from datetime import datetime

if TYPE_CHECKING:
    from app.projects.models import Projects
    from app.tasks.models import Tasks
    from app.comments.models import Comments


class Users(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    
    # One user → Many projects  (One to Many)
    projects: Mapped[List["Projects"]] = relationship(
        back_populates="owner", cascade="all, delete"
    )
    # One user → Many tasks     (One to Many)
    tasks: Mapped[List["Tasks"]] = relationship(
        back_populates="assigned_user"
    )
    # One user → Many comments   (One to Many) 
    comments: Mapped[List["Comments"]] = relationship(
        back_populates="user", cascade="all, delete"
    )
