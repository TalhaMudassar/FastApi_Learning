# Module 3: Dependencies with yield & Teardown Cleanup
# yield replaces simple return. Code before yield executes prior to the route handler; code after yield executes after the response is generated.
# Always wrap teardown in try...finally to ensure cleanups happen even if the client disconnects or the route raises an unhandled exception.

from typing import Annotated, AsyncGenerator
from fastapi import FastAPI, Depends, HTTPException, status

app = FastAPI(title="Yield Resource Management")

# Mock Database Engine
class MockDatabaseConnection:
    def __init__(self):
        self.is_connected = True
        print("[DB] Connection opened.")

    def close(self):
        self.is_connected = False
        print("[DB] Connection closed cleanly.")

# Dependency with yield
async def get_db() -> AsyncGenerator[MockDatabaseConnection, None]:
    db = MockDatabaseConnection()
    try:
        # Pre-execution: Provide database resource to route
        yield db
    finally:
        # Post-execution: Guaranteed cleanup (runs after route completes or errors out)
        db.close()

DbDep = Annotated[MockDatabaseConnection, Depends(get_db)]

@app.get("/orders")
async def get_orders(db: DbDep):
    return {"connected": db.is_connected, "data": ["order_1", "order_2"]}

@app.get("/failing-route")
async def failing_route(db: DbDep):
    # Even if this route raises an HTTP exception, db.close() in finally block executes!
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Crash test")