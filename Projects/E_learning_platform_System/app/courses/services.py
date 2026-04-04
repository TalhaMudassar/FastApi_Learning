from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.courses.models import Course
from app.courses.schemas import *


async def create_course(session: AsyncSession, data: CourseCreate):
    course = Course(**data.model_dump())

    session.add(course)
    await session.commit()
    await session.refresh(course)

    return course


async def get_course(session: AsyncSession, course_id: int):
    course = await session.get(Course, course_id)

    if not course:
        raise HTTPException(404, "Course not found")

    return course


async def get_courses(session: AsyncSession):
    result = await session.scalars(select(Course))
    return result.all()


async def update_course(session: AsyncSession, course_id: int, data: CourseUpdate):
    course = await get_course(session, course_id)

    for key, value in data.model_dump().items():
        setattr(course, key, value)

    await session.commit()
    await session.refresh(course)

    return course


async def patch_course(session: AsyncSession, course_id: int, data: CoursePatch):
    course = await get_course(session, course_id)

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(course, key, value)

    await session.commit()
    await session.refresh(course)

    return course


async def delete_course(session: AsyncSession, course_id: int):
    course = await get_course(session, course_id)

    await session.delete(course)
    await session.commit()

    return {"message": "Course deleted"}