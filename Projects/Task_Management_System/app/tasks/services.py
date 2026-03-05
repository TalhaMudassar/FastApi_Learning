from app.db.config import async_session
from app.tasks.models import Tasks
from app.projects.models import Projects
from app.users.models import Users
from sqlalchemy import select
from fastapi import HTTPException
from app.tasks.schemas import TaskCreate, TaskUpdate, TaskPatch

from sqlalchemy.ext.asyncio import AsyncSession


async def create_task(session:AsyncSession,new_task: TaskCreate):

        project = await session.get(Projects, new_task.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if new_task.assigned_to:
            user = await session.get(Users, new_task.assigned_to)
            if not user:
                raise HTTPException(status_code=404, detail="Assigned user not found")

        task = Tasks(**new_task.model_dump())

        session.add(task)
        await session.commit()
        await session.refresh(task)
        return task


async def get_task(session:AsyncSession,task_id: int):

        task = await session.get(Tasks, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task


async def get_all_tasks(session:AsyncSession):
        result = await session.scalars(select(Tasks))
        return result.all()


async def update_task(session:AsyncSession,task_id: int, new_task: TaskUpdate):

        task = await session.get(Tasks, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        for key, value in new_task.model_dump().items():
            setattr(task, key, value)

        await session.commit()
        await session.refresh(task)
        return task


async def patch_task(session:AsyncSession,task_id: int, new_task: TaskPatch):

        task = await session.get(Tasks, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        for key, value in new_task.model_dump(exclude_unset=True).items():
            setattr(task, key, value)

        await session.commit()
        await session.refresh(task)
        return task


async def delete_task(session:AsyncSession,task_id: int):

        task = await session.get(Tasks, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        await session.delete(task)
        await session.commit()

        return {"message": "Task deleted successfully"}