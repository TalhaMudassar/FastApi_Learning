from sqlalchemy import create_engine
DATABASE_URL =  "sqlite:///./sqlite.db"   
engine = create_engine(DATABASE_URL,echo=True) # ECHO ALWAYS TRUE DURING DEBUGGING
# THIS JUST THE ENGINE  DATABASE CONNECTION ESTABLISHED TILL NOW ...



from sqlalchemy import create_engine

# ==================================================
# Database URL
# ==================================================
# For SQLite:
# sqlite:///./sqlite.db
# Means: create/use a file named "sqlite.db" in current directory

DATABASE_URL = "sqlite:///./sqlite.db"

# ==================================================
# Create Engine
# ==================================================
# echo=True -> shows all SQL queries in terminal (very useful for debugging)
engine = create_engine(
    DATABASE_URL,
    echo=True  # Keep True during development, False in production
)

# ==================================================
# At this point:
# ✔ Engine is created
# ✔ Database connection is configured
# ❌ No tables yet
# ❌ No models yet
# ❌ No session yet
# ==================================================


