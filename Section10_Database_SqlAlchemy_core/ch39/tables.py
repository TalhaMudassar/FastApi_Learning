from db import engine
from sqlalchemy import MetaData, Table, Column, Integer, String, ForeignKey

metadata = MetaData()

# ==================================================
# Users Table
# ==================================================
users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(length=50), nullable=False),
    Column("email", String, nullable=False, unique=True),
    Column("phoneno", String, nullable=True),
)

# ==================================================
# Posts Table (One user -> Many posts)
# ==================================================
posts = Table(
    "posts",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True),
    Column("title", String, nullable=False),
    Column("content", String, nullable=False),
)

# ==================================================
# Create all tables
# ==================================================
def create_tables():
    metadata.create_all(engine)
    print("✅ Tables created successfully!")
