from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.lessons.models import Lesson
from app.lessons.schemas import *


# ===============================
# Create
# ===============================
async def create_lesson(session: AsyncSession, data: LessonCreate):
    lesson = Lesson(**data.model_dump())

    session.add(lesson)
    await session.commit()
    await session.refresh(lesson)

    return lesson


# ===============================
# Get One
# ===============================
async def get_lesson(session: AsyncSession, lesson_id: int):
    lesson = await session.get(Lesson, lesson_id)

    if not lesson:
        raise HTTPException(404, "Lesson not found")

    return lesson


# ===============================
# Get All
# ===============================
async def get_lessons(session: AsyncSession):
    result = await session.scalars(select(Lesson))
    return result.all()


# ===============================
# Update
# ===============================
async def update_lesson(session: AsyncSession, lesson_id: int, data: LessonUpdate):
    lesson = await get_lesson(session, lesson_id)

    for key, value in data.model_dump().items():
        setattr(lesson, key, value)

    await session.commit()
    await session.refresh(lesson)

    return lesson


# ===============================
# Patch
# ===============================
async def patch_lesson(session: AsyncSession, lesson_id: int, data: LessonPatch):
    lesson = await get_lesson(session, lesson_id)

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(lesson, key, value)

    await session.commit()
    await session.refresh(lesson)

    return lesson


# ===============================
# Delete
# ===============================
async def delete_lesson(session: AsyncSession, lesson_id: int):
    lesson = await get_lesson(session, lesson_id)

    await session.delete(lesson)
    await session.commit()

    return {"message": "Lesson deleted"}