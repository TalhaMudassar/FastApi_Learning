from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncAttrs

class Base(AsyncAttrs, DeclarativeBase):
    pass


from app.appointments import models as appointments_model
from app.patients import models as patients_model
from app.prescription_items import models as prescription_items_model
from app.prescriptions import models as prescriptions_model
from app.doctors import models as doctors_model
from app.medicines import models as medicines