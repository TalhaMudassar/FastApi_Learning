from fastapi import FastAPI, Depends
from app.routers import users, items
from app.dependencies import verify_key

app = FastAPI(
    title="Modular Enterprise API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 1. Global API Prefix Stacking:
# users.router already has prefix="/users".
# Adding prefix="/api/v1" creates: /api/v1/users/
app.include_router(
    users.router,
    prefix="/api/v1"
)

# 2. Applying an additional top-level dependency at inclusion:
# Requires the 'x-key' header for all item endpoints without touching items.py
app.include_router(
    items.router,
    prefix="/api/v1",
    dependencies=[Depends(verify_key)]
)

@app.get("/")
async def root():
    return {"status": "online", "version": "1.0.0"}