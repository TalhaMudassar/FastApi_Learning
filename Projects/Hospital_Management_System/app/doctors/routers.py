from fastapi import APIRouter, status
from typing import List
from app.db.config import SessionDep
from app.doctors.schemas import DoctorCreate, DoctorOut, DoctorUpdate, DoctorPatch
from app.doctors import services

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.post("/", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
async def create_doctor(session: SessionDep, data: DoctorCreate):
    return await services.create_doctor(session, data)

@router.get("/", response_model=List[DoctorOut])
async def get_all_doctors(session: SessionDep):
    return await services.get_all_doctors(session)

@router.get("/{doctor_id}", response_model=DoctorOut)
async def get_doctor(session: SessionDep, doctor_id: int):
    return await services.get_doctor_by_id(session, doctor_id)

@router.put("/{doctor_id}", response_model=DoctorOut)
async def update_doctor(session: SessionDep, doctor_id: int, data: DoctorUpdate):
    return await services.update_doctor(session, doctor_id, data)

@router.patch("/{doctor_id}", response_model=DoctorOut)
async def patch_doctor(session: SessionDep, doctor_id: int, data: DoctorPatch):
    return await services.patch_doctor(session, doctor_id, data)

@router.delete("/{doctor_id}")
async def delete_doctor(session: SessionDep, doctor_id: int):
    return await services.delete_doctor(session, doctor_id)