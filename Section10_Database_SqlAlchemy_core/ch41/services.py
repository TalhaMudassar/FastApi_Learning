from db import engine
from sqlalchemy import text

# ==================================================
# RAW SQL INSERT
# ==================================================
# Using parameterized query (Safe from SQL injection)

def raw_sql_insert():
    with engine.connect() as conn:
        stmt = text("""
            INSERT INTO users (name, email)
            VALUES (:name, :email)
        """)

        conn.execute(
            stmt,
            {"name": "Talha", "email": "talha@gmail.com"}
        )

        conn.commit()
        print("✅ Raw SQL Insert Successful")


# ==================================================
# RAW SQL SELECT
# ==================================================

def raw_sql_select():
    with engine.connect() as conn:
        stmt = text("""SELECT * 
                    FROM users 
                    WHERE email = :email """)

        result = conn.execute(
            stmt,
            {"email": "talha@gmail.com"}   # THIS IS PASSING PARAMETER 
        )

        return result.fetchall()   # Fetch data properly
