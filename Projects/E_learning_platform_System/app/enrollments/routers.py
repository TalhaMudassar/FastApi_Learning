from fastapi import APIRouter
from typing import List
from app.db.config import SessionDep
from app.enrollments.schemas import *
from app.enrollments import services

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])


@router.post("/", response_model=EnrollmentOut)
async def create_enrollment(session: SessionDep, data: EnrollmentCreate):
    return await services.create_enrollment(session, data)


@router.get("/", response_model=List[EnrollmentOut])
async def get_enrollments(session: SessionDep):
    return await services.get_enrollments(session)


@router.get("/{enrollment_id}", response_model=EnrollmentOut)
async def get_enrollment(session: SessionDep, enrollment_id: int):
    return await services.get_enrollment(session, enrollment_id)


@router.put("/{enrollment_id}", response_model=EnrollmentOut)
async def update_enrollment(session: SessionDep, enrollment_id: int, data: EnrollmentUpdate):
    return await services.update_enrollment(session, enrollment_id, data)


@router.patch("/{enrollment_id}", response_model=EnrollmentOut)
async def patch_enrollment(session: SessionDep, enrollment_id: int, data: EnrollmentPatch):
    return await services.patch_enrollment(session, enrollment_id, data)


@router.delete("/{enrollment_id}")
async def delete_enrollment(session: SessionDep, enrollment_id: int):
    return await services.delete_enrollment(session, enrollment_id)