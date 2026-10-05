import sys, os
sys.path.insert(0, os.path.abspath("."))
import asyncio
from sqlalchemy import text
from app.db.config import engine

async def check():
    async with engine.connect() as conn:
        r = await conn.execute(text("DESCRIBE payments"))
        for row in r.fetchall():
            if row[0] in ['status', 'pg_payment_id', 'is_paid', 'payment_gateway']:
                print(row)

if __name__ == "__main__":
    asyncio.run(check())
