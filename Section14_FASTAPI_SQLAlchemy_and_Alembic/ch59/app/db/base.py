from sqlalchemy.orm  import DeclarativeBase

class Base(DeclarativeBase):
    pass


#Import user Model
from app.user import models

#Import product Model
from app.product import models

