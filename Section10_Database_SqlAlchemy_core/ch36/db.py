from sqlalchemy import create_engine

# ==================================================
# Database URL
# ==================================================
# SQLite database file will be created in project folder
DATABASE_URL = "sqlite:///./sqlite.db"

# ==================================================
# Create Engine
# ==================================================
# echo=True -> shows SQL queries in terminal (good for learning/debugging)
engine = create_engine(
    DATABASE_URL,
    echo=True
)

# ==================================================
# At this stage:
# ✔ Engine is created
# ✔ Database connection is configured
# ❌ No tables yet
# ❌ No data yet
# ==================================================
