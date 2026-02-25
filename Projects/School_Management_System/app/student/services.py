from sqlalchemy import select, update, delete
from app.db.config import async_session
from app.student.models import Student


# INSERT STUDENT
async def create_student(**kwargs):
    async with async_session() as session:
        student = Student(**kwargs)
        session.add(student)
        await session.commit()
        await session.refresh(student)
        return student


# READ STUDENT
async def get_students():
    async with async_session() as session:
        stmt = select(Student)
        result = await session.scalars(stmt)
        return result.all()


# READ SINGLE STUDENT
async def get_student(student_id: int):
    async with async_session() as session:
        stmt = select(Student).where(Student.student_id == student_id)
        return await session.scalar(stmt)


# UPDATE STUDENT 
async def update_student(student_id: int, **kwargs):
    async with async_session() as session:
        stmt = (
            update(Student)
            .where(Student.student_id == student_id)
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await session.execute(stmt)
        await session.commit()
        return await get_student(student_id)


# DELETE STUDENT
async def delete_student(student_id: int):
    async with async_session() as session:
        stmt = delete(Student).where(Student.student_id == student_id)
        await session.execute(stmt)
        await session.commit()
        return {"status": "deleted"}