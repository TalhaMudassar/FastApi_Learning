from sqlmodel import Field, SQLModel
from typing import Optional

class TaskBase(SQLModel):
    title: str
    content: str

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskPatch(SQLModel):
    title: str | None = None
    content: str | None = None

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class TaskOut(TaskBase):
    id: int