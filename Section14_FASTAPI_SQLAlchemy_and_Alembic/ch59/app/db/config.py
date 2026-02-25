from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# For better routing 
import os 
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
db_path = os.path.join(BASE_DIR,"sqlite.db")

# and update this 
DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(bind=engine,expire_on_commit=False)
