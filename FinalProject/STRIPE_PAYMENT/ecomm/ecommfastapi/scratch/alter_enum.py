import sys, os
sys.path.insert(0, os.path.abspath("."))
import asyncio
from sqlalchemy import text
from app.db.config import engine

async def alter_enum():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE payments MODIFY COLUMN status ENUM('pending', 'success', 'failed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending';"))
        res = await conn.execute(text("DESCRIBE payments"))
        for row in res.fetchall():
            if row[0] == 'status':
                print("Updated payments.status:", row)

if __name__ == "__main__":
    asyncio.run(alter_enum())
