from sqlmodel import Session, select
from app.tasks.models import Task, TaskOut , TaskUpdate, TaskCreate, TaskPatch
from app.db.config import engine
from fastapi import HTTPException
from app.tasks.models import Task

def create_task(new_task = Task) -> TaskOut:
    task = Task(title=new_task.title,content=new_task.  content)
    with Session(engine) as session:
        session.add(task)
        session.commit()
        session.refresh(task)
        return task
    
def get_all_tasks() -> list[TaskOut]:
    with Session(engine) as session:
        stmt = select(Task)
        tasks = session.exec(stmt)
        return tasks.all()
    
def get_task_by_id(task_id:int) -> TaskOut:
    with Session(engine) as session:
        task = session.get(Task,task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    
    
def update_task(task_id:int,new_task=TaskUpdate) -> TaskOut:
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task Not Found")
        task_data = new_task.model_dump()
        task.sqlmodel_update(task_data)
        session.add(task)
        session.commit()
        session.refresh(task)
        return task
    
    
    
def patch_task(task_id:int,new_task=TaskPatch) -> TaskOut:
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task Not Found")
        if new_task.title is not None:
            task.title = new_task.title
        if new_task.content is not None:
            task.content = new_task.content
        session.add(task)
        session.commit()
        session.refresh(task)
        return task
    
    
    
def delete_task(task_id:int):
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task Not found ")
        session.delete(task)
        session.commit()
        return task