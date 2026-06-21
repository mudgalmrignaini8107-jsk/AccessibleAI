from app.database.connection import SessionLocal
from app.api.endpoints.places import get_stats
import asyncio

async def test():
    db = SessionLocal()
    try:
        res = await get_stats(db)
        print("Stats Result:", res)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test())
