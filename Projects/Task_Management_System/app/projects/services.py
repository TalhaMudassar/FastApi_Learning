from app.db.config import async_session
from app.projects.models import Projects
from app.users.models import Users
from sqlalchemy import select
from fastapi import HTTPException
from app.projects.schemas import ProjectCreate, ProjectUpdate, ProjectPatch

from sqlalchemy.ext.asyncio import AsyncSession


async def create_project(session:AsyncSession,new_project: ProjectCreate):
  

        owner = await session.get(Users, new_project.owner_id)
        if not owner:
            raise HTTPException(status_code=404, detail="Owner not found")

        project = Projects(**new_project.model_dump())

        session.add(project)
        await session.commit()
        await session.refresh(project)
        return project


async def get_project(session:AsyncSession,project_id: int):
  
        project = await session.get(Projects, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project


async def get_all_projects(session:AsyncSession):

        result = await session.scalars(select(Projects))
        return result.all()


async def update_project(session:AsyncSession,project_id: int, new_project: ProjectUpdate):
   
        project = await session.get(Projects, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        for key, value in new_project.model_dump().items():
            setattr(project, key, value)

        await session.commit()
        await session.refresh(project)
        return project


async def patch_project(session:AsyncSession,project_id: int, new_project: ProjectPatch):

        project = await session.get(Projects, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        for key, value in new_project.model_dump(exclude_unset=True).items():
            setattr(project, key, value)

        await session.commit()
        await session.refresh(project)
        return project


async def delete_project(session:AsyncSession,project_id: int):
    
        project = await session.get(Projects, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        await session.delete(project)
        await session.commit()

        return {"message": "Project deleted successfully"}