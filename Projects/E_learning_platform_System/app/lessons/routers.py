from fastapi import APIRouter
from typing import List
from app.db.config import SessionDep
from app.lessons.schemas import *
from app.lessons import services

router = APIRouter(prefix="/lessons", tags=["Lessons"])


@router.post("/", response_model=LessonOut)
async def create_lesson(session: SessionDep, data: LessonCreate):
    return await services.create_lesson(session, data)


@router.get("/", response_model=List[LessonOut])
async def get_lessons(session: SessionDep):
    return await services.get_lessons(session)


@router.get("/{lesson_id}", response_model=LessonOut)
async def get_lesson(session: SessionDep, lesson_id: int):
    return await services.get_lesson(session, lesson_id)


@router.put("/{lesson_id}", response_model=LessonOut)
async def update_lesson(session: SessionDep, lesson_id: int, data: LessonUpdate):
    return await services.update_lesson(session, lesson_id, data)


@router.patch("/{lesson_id}", response_model=LessonOut)
async def patch_lesson(session: SessionDep, lesson_id: int, data: LessonPatch):
    return await services.patch_lesson(session, lesson_id, data)


@router.delete("/{lesson_id}")
async def delete_lesson(session: SessionDep, lesson_id: int):
    return await services.delete_lesson(session, lesson_id)