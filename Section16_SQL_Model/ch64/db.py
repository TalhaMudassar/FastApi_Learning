from sqlmodel import create_engine,SQLModel

DATABASE_URL = "sqlite:///sqlite.db"

engine = create_engine(DATABASE_URL, echo=True)

def create_table():
    SQLModel.metadata.create_all(engine)