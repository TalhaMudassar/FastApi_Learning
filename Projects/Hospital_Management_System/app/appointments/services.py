from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.appointments.models import Appointment
from app.appointments.schemas import AppointmentCreate, AppointmentUpdate, AppointmentPatch

# ===============================
# Create
# ===============================
async def create_appointment(session: AsyncSession, data: AppointmentCreate):
    """Creates a new appointment in the database."""
    appointment = Appointment(**data.model_dump())
    session.add(appointment)
    await session.commit()
    await session.refresh(appointment)
    return appointment

# ===============================
# Read
# ===============================
async def get_appointment_by_id(session: AsyncSession, id: int):
    """Retrieves an appointment by its ID. Raises 404 if not found."""
    appointment = await session.get(Appointment, id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

async def get_all_appointments(session: AsyncSession):
    """Retrieves all appointments."""
    result = await session.scalars(select(Appointment))
    return result.all()

# ===============================
# Update (Full)
# ===============================
async def update_appointment(session: AsyncSession, id: int, data: AppointmentUpdate):
    """Replaces an entire appointment record."""
    appointment = await get_appointment_by_id(session, id)

    for key, value in data.model_dump().items():
        setattr(appointment, key, value)

    await session.commit()
    await session.refresh(appointment)
    return appointment

# ===============================
# Patch (Partial)
# ===============================
async def patch_appointment(session: AsyncSession, id: int, data: AppointmentPatch):
    """Updates only the provided fields of an appointment."""
    appointment = await get_appointment_by_id(session, id)
    
    # exclude_unset=True ensures we only update fields the user actually sent
    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(appointment, key, value)

    await session.commit()
    await session.refresh(appointment)
    return appointment

# ===============================
# Delete
# ===============================
async def delete_appointment(session: AsyncSession, id: int):
    """Deletes an appointment from the database."""
    appointment = await get_appointment_by_id(session, id)

    await session.delete(appointment)
    await session.commit()
    return {"message": "Appointment successfully deleted"}