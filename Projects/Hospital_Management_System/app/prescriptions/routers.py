from fastapi import APIRouter, status
from typing import List
from app.db.config import SessionDep
from app.prescriptions.schemas import PrescriptionCreate, PrescriptionOut, PrescriptionUpdate, PrescriptionPatch
from app.prescriptions import services

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.post("/", response_model=PrescriptionOut, status_code=status.HTTP_201_CREATED)
async def create_prescription(session: SessionDep, data: PrescriptionCreate):
    return await services.create_prescription(session, data)

@router.get("/", response_model=List[PrescriptionOut])
async def get_all_prescriptions(session: SessionDep):
    return await services.get_all_prescriptions(session)

@router.get("/{prescription_id}", response_model=PrescriptionOut)
async def get_prescription(session: SessionDep, prescription_id: int):
    return await services.get_prescription_by_id(session, prescription_id)

@router.put("/{prescription_id}", response_model=PrescriptionOut)
async def update_prescription(session: SessionDep, prescription_id: int, data: PrescriptionUpdate):
    return await services.update_prescription(session, prescription_id, data)

@router.patch("/{prescription_id}", response_model=PrescriptionOut)
async def patch_prescription(session: SessionDep, prescription_id: int, data: PrescriptionPatch):
    return await services.patch_prescription(session, prescription_id, data)

@router.delete("/{prescription_id}")
async def delete_prescription(session: SessionDep, prescription_id: int):
    return await services.delete_prescription(session, prescription_id)