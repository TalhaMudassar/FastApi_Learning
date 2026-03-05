from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


# -------------------------
# Base
# -------------------------

class CommentBase(BaseModel):
    content: str = Field(..., example="This task needs improvement")


# -------------------------
# Create
# -------------------------

class CommentCreate(CommentBase):
    task_id: int
    user_id: int


# -------------------------
# Full Update
# -------------------------

class CommentUpdate(CommentBase):
    task_id: int
    user_id: int


# -------------------------
# Patch
# -------------------------

class CommentPatch(BaseModel):
    content: str | None = None


# -------------------------
# Response
# -------------------------

class CommentOut(CommentBase):
    comment_id: int
    task_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)