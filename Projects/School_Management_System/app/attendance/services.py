from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.attendance.models import Attendance


async def create_attendance(**kwargs):
    async with async_session() as session:
        attendance = Attendance(**kwargs)
        session.add(attendance)
        await session.commit()
        await session.refresh(attendance)
        return attendance


async def get_attendance():
    async with async_session() as session:
        stmt = select(Attendance)
        result = await session.scalars(stmt)
        return result.all()


async def update_attendance(student_id: int, date, **kwargs):
    async with async_session() as session:
        stmt = (
            update(Attendance)
            .where(
                Attendance.student_id == student_id,
                Attendance.date == date
            )
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return {"status": "updated"}


async def delete_attendance(student_id: int, date):
    async with async_session() as session:
        stmt = delete(Attendance).where(
            Attendance.student_id == student_id,
            Attendance.date == date
        )
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}