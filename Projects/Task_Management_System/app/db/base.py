from sqlalchemy.orm  import DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncAttrs



class Base(AsyncAttrs,DeclarativeBase):
    pass


from app.users import models as users_model
from app.tasks import models as tasks_model
from app.comments import models as comments_model
from app.projects import models as projects_model

