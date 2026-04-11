from fastapi import APIRouter, status
from typing import List
from app.db.config import SessionDep
from app.medicines.schemas import MedicineCreate, MedicineOut, MedicineUpdate, MedicinePatch
from app.medicines import services

router = APIRouter(prefix="/medicines", tags=["Medicines"])

@router.post("/", response_model=MedicineOut, status_code=status.HTTP_201_CREATED)
async def create_medicine(session: SessionDep, data: MedicineCreate):
    return await services.create_medicine(session, data)

@router.get("/", response_model=List[MedicineOut])
async def get_all_medicines(session: SessionDep):
    return await services.get_all_medicines(session)

@router.get("/{medicine_id}", response_model=MedicineOut)
async def get_medicine(session: SessionDep, medicine_id: int):
    return await services.get_medicine_by_id(session, medicine_id)

@router.put("/{medicine_id}", response_model=MedicineOut)
async def update_medicine(session: SessionDep, medicine_id: int, data: MedicineUpdate):
    return await services.update_medicine(session, medicine_id, data)

@router.patch("/{medicine_id}", response_model=MedicineOut)
async def patch_medicine(session: SessionDep, medicine_id: int, data: MedicinePatch):
    return await services.patch_medicine(session, medicine_id, data)

@router.delete("/{medicine_id}")
async def delete_medicine(session: SessionDep, medicine_id: int):
    return await services.delete_medicine(session, medicine_id)