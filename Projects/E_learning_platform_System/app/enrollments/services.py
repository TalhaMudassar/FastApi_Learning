from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.enrollments.models import Enrollment
from app.enrollments.schemas import *


# ===============================
# Create
# ===============================
async def create_enrollment(session: AsyncSession, data: EnrollmentCreate):
    enrollment = Enrollment(**data.model_dump())

    session.add(enrollment)

    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise HTTPException(400, "Already enrolled or invalid data")

    await session.refresh(enrollment)
    return enrollment


# ===============================
# Get One
# ===============================
async def get_enrollment(session: AsyncSession, enrollment_id: int):
    enrollment = await session.get(Enrollment, enrollment_id)

    if not enrollment:
        raise HTTPException(404, "Enrollment not found")

    return enrollment


# ===============================
# Get All
# ===============================
async def get_enrollments(session: AsyncSession):
    result = await session.scalars(select(Enrollment))
    return result.all()


# ===============================
# Update
# ===============================
async def update_enrollment(session: AsyncSession, enrollment_id: int, data: EnrollmentUpdate):
    enrollment = await get_enrollment(session, enrollment_id)

    for key, value in data.model_dump().items():
        setattr(enrollment, key, value)

    await session.commit()
    await session.refresh(enrollment)

    return enrollment


# ===============================
# Patch
# ===============================
async def patch_enrollment(session: AsyncSession, enrollment_id: int, data: EnrollmentPatch):
    enrollment = await get_enrollment(session, enrollment_id)

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(enrollment, key, value)

    await session.commit()
    await session.refresh(enrollment)

    return enrollment


# ===============================
# Delete
# ===============================
async def delete_enrollment(session: AsyncSession, enrollment_id: int):
    enrollment = await get_enrollment(session, enrollment_id)

    await session.delete(enrollment)
    await session.commit()

    return {"message": "Enrollment deleted"}