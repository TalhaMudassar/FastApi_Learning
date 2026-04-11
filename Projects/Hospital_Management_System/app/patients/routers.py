from fastapi import APIRouter, status
from typing import List
from app.db.config import SessionDep
from app.patients.schemas import PatientCreate, PatientOut, PatientUpdate, PatientPatch
from app.patients import services

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("/", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
async def create_patient(session: SessionDep, data: PatientCreate):
    return await services.create_patient(session, data)

@router.get("/", response_model=List[PatientOut])
async def get_all_patients(session: SessionDep):
    return await services.get_all_patients(session)

@router.get("/{patient_id}", response_model=PatientOut)
async def get_patient(session: SessionDep, patient_id: int):
    return await services.get_patient_by_id(session, patient_id)

@router.put("/{patient_id}", response_model=PatientOut)
async def update_patient(session: SessionDep, patient_id: int, data: PatientUpdate):
    return await services.update_patient(session, patient_id, data)

@router.patch("/{patient_id}", response_model=PatientOut)
async def patch_patient(session: SessionDep, patient_id: int, data: PatientPatch):
    return await services.patch_patient(session, patient_id, data)

@router.delete("/{patient_id}")
async def delete_patient(session: SessionDep, patient_id: int):
    return await services.delete_patient(session, patient_id)