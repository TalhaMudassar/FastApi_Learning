from fastapi import APIRouter
from typing import List
from app.db.config import SessionDep
from app.courses.schemas import *
from app.courses import services

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post("/", response_model=CourseOut)
async def create_course(session: SessionDep, data: CourseCreate):
    return await services.create_course(session, data)


@router.get("/", response_model=List[CourseOut])
async def get_courses(session: SessionDep):
    return await services.get_courses(session)


@router.get("/{course_id}", response_model=CourseOut)
async def get_course(session: SessionDep, course_id: int):
    return await services.get_course(session, course_id)


@router.put("/{course_id}", response_model=CourseOut)
async def update_course(session: SessionDep, course_id: int, data: CourseUpdate):
    return await services.update_course(session, course_id, data)


@router.patch("/{course_id}", response_model=CourseOut)
async def patch_course(session: SessionDep, course_id: int, data: CoursePatch):
    return await services.patch_course(session, course_id, data)


@router.delete("/{course_id}")
async def delete_course(session: SessionDep, course_id: int):
    return await services.delete_course(session, course_id)