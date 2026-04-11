from fastapi import APIRouter, status
from typing import List
from app.db.config import SessionDep
from app.appointments.schemas import AppointmentCreate, AppointmentOut, AppointmentUpdate, AppointmentPatch
from app.appointments import services

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# POST: Create a new appointment (Data goes in the JSON body automatically)
@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
async def create_appointment(session: SessionDep, data: AppointmentCreate):
    return await services.create_appointment(session, data)

# GET: Fetch all appointments
@router.get("/", response_model=List[AppointmentOut])
async def get_all_appointments(session: SessionDep):
    return await services.get_all_appointments(session)

# GET: Fetch a single appointment by its ID in the URL path
@router.get("/{appointment_id}", response_model=AppointmentOut)
async def get_appointment(session: SessionDep, appointment_id: int):
    return await services.get_appointment_by_id(session, appointment_id)

# PUT: Fully update an appointment
@router.put("/{appointment_id}", response_model=AppointmentOut)
async def update_appointment(session: SessionDep, appointment_id: int, data: AppointmentUpdate):
    return await services.update_appointment(session, appointment_id, data)

# PATCH: Partially update an appointment (e.g., changing only the status)
@router.patch("/{appointment_id}", response_model=AppointmentOut)
async def patch_appointment(session: SessionDep, appointment_id: int, data: AppointmentPatch):
    return await services.patch_appointment(session, appointment_id, data)

# DELETE: Remove an appointment
@router.delete("/{appointment_id}")
async def delete_appointment(session: SessionDep, appointment_id: int):
    return await services.delete_appointment(session, appointment_id)