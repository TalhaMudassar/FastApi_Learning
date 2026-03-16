from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.config import create_tables
from app.tasks.services import * 
from app.tasks.models import TaskOut, TaskCreate, TaskPatch, TaskUpdate   # Import sqlmodel pydantic


@asynccontextmanager
async def lifespan(app:FastAPI):
    create_tables()
    yield
    
app = FastAPI(lifespan=lifespan)


@app.post("/task", response_model=TaskOut)
def task_create(new_task:TaskCreate):
    task = create_task(new_task)
    return task

@app.get("/tasks", response_model=list[TaskOut])
def all_task():
    task = get_all_tasks()
    return task


@app.get("/task/{task_id}", response_model=TaskOut)
def get_task(task_id:int):
    task = get_task_by_id(task_id)
    return task


@app.put("/task/{task_id}", response_model=TaskOut)
def put_task(task_id:int, new_task:TaskUpdate):
    task = update_task(task_id, new_task)
    return task



@app.patch("/task/{task_id}",response_model=TaskOut)
def patch_task_fun(task_id:int, new_task:TaskPatch):
    task = patch_task(task_id, new_task)
    return task

@app.delete("/task/{task_id}")
def task_delete(task_id:int):
    task =delete_task(task_id)
    return task