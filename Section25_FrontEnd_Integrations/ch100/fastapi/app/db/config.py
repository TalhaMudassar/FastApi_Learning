from sqlmodel import SQLModel, create_engine, Session
from fastapi import Depends
from typing import Annotated
import os

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

db_path = os.path.join(BASE_DIR, "sqlite.db")

DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL, echo=True)

def create_tables():
    SQLModel.metadata.create_all(engine)

# -----------------------------
# Database Session Dependency
# -----------------------------
def get_session():
    with Session(engine) as session:
        yield session

# Dependency type
SessionDep = Annotated[Session, Depends(get_session)]
