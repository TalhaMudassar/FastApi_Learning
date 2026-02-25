from sqlalchemy import MetaData, Table, Column, Integer, String
from db import engine

# ==================================================
# Metadata object
# ==================================================
# Metadata stores table definitions
metadata = MetaData()

# ==================================================
# User Table
# ==================================================
users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(length=50), nullable=False),
    Column("email", String, nullable=False, unique=True),
    Column("phoneno", String, nullable=False),
)

# ==================================================
# Address Table
# ==================================================
address = Table(
    "address",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("street", String(length=50), nullable=False),
    Column("dist", String, nullable=False),
    Column("country", String, nullable=False),
)

# ==================================================
# Create Tables in Database
# ==================================================
def create_tables():
    metadata.create_all(engine)
    print("✅ Tables created successfully!")

# ==================================================
# Drop Tables in Database (Optional / For Testing)
# ==================================================
# def drop_tables():
#     metadata.drop_all(engine)
#     print("❌ Tables dropped successfully!")
