from fastapi import FastAPI

# ==========================================
# 🚨 CRITICAL FIX: IMPORT ALL MODELS HERE
# This prevents the "failed to locate a name" 
# SQLAlchemy relationship crash!
# ==========================================
from app.patients.models import Patient
from app.doctors.models import Doctor
from app.appointments.models import Appointment
from app.prescriptions.models import Prescription
from app.medicines.models import Medicine
from app.prescription_items.models import PrescriptionItem

# ==========================================
# IMPORT ROUTERS
# ==========================================
from app.appointments.routers import router as appointments_router 
from app.doctors.routers import router as doctors_router
from app.medicines.routers import router as medicines_routers
from app.prescription_items.routers import router as prescription_items_router
from app.prescriptions.routers import router as prescriptions_routers
from app.patients.routers import router as patients_routers

# I added a title for your Swagger Docs!
app = FastAPI(title="Hospital Management System API")

# ==========================================
# INCLUDE ROUTERS
# ==========================================
app.include_router(appointments_router)
app.include_router(doctors_router)
app.include_router(medicines_routers)
app.include_router(prescription_items_router)
app.include_router(prescriptions_routers)
app.include_router(patients_routers)