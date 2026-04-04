from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncAttrs

class Base(AsyncAttrs,DeclarativeBase):
    pass 

 
from app.users import models as user_model
from app.categories import models as categories_model
from app.courses import models as courses_model
from app.enrollments import models as enrollments_model
from app.lessons import models as lessons_model
