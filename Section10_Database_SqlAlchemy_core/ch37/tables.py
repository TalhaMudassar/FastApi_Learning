from db import engine
from sqlalchemy import MetaData, Table, Column, Integer, String, ForeignKey

metadata = MetaData()

# ==================================================
# Users Table
# ==================================================
user = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(length=50), nullable=False),
    Column("email", String, nullable=False, unique=True),
    Column("phoneno", String, nullable=False),
)

# ==================================================
# ONE TO ONE RELATIONSHIP
# Each user has one profile
# ==================================================
profile = Table(
    "profile",
    metadata,
    Column("id", Integer, primary_key=True),
    Column(
        "user_id",
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # ensures one profile per user
    ),
    Column("bio", String, nullable=False),
    Column("address", String, nullable=False),
)

# ==================================================
# ONE TO MANY RELATIONSHIP
# Each user can have multiple posts
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
# MANY TO MANY RELATIONSHIP
# Users can have multiple addresses, and addresses can belong to multiple users
# ==================================================
address = Table(
    "address",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("street", String, nullable=False),
    Column("content", String, nullable=False)
)

# Association Table to implement many-to-many
user_address_association = Table(
    "user_address_association",
    metadata,
    Column(
        "user_id", Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    ),
    Column(
        "address_id", Integer,
        ForeignKey("address.id", ondelete="CASCADE"),
        primary_key=True
    ),
)

# ==================================================
# Function to create all tables
# ==================================================
def create_tables():
    metadata.create_all(engine)
    print("✅ Tables created successfully!")
