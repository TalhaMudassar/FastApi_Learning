from sqlmodel import Field, SQLModel

class TaskBase(SQLModel):
    title: str
    content: str
    
class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass


class TaskPatch(TaskBase):
    title: str | None = None
    content: str | None = None

class Task(SQLModel, table=True):
    id: int =Field(primary_key=True)
    title: str
    content: str 