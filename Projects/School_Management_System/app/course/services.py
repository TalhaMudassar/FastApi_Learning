from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.course.models import Course


async def create_course(**kwargs):
    async with async_session() as session:
        course = Course(**kwargs)
        session.add(course)
        await session.commit()
        await session.refresh(course)
        return course


async def get_courses():
    async with async_session() as session:
        stmt = select(Course)
        result = await session.scalars(stmt)
        return result.all()


async def get_course(course_id: int):
    async with async_session() as session:
        stmt = select(Course).where(Course.course_id == course_id)
        return await session.scalar(stmt)


async def update_course(course_id: int, **kwargs):
    async with async_session() as session:
        stmt = (
            update(Course)
            .where(Course.course_id == course_id)
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await get_course(course_id)


async def delete_course(course_id: int):
    async with async_session() as session:
        stmt = delete(Course).where(Course.course_id == course_id)
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}