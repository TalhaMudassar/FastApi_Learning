from sqlmodel import SQLModel, create_engine
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # this we can do that just becuase our sqlmodel db will make at the root level 

db_path = os.path.join(BASE_DIR, "sqlite.db")
DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL, echo=True) #echo = True for production becuase it give me db quries during development


def create_tables():
    SQLModel.metadata.create_all(engine)