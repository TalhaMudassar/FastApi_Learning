# Module 5: Route-, Router-, and Global-Level Dependencies
# Dependencies can run at multiple structural levels without polluting function
# signatures when the returned value is not needed in the route handler.

from typing import Annotated
from fastapi import FastAPI, APIRouter, Depends, Header, HTTPException, status

# 1. Dependency definitions
async def verify_global_api_key(x_api_key: Annotated[str, Header()]):
    if x_api_key != "secret-global-key":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API Key")

async def verify_admin_ip(x_forwarded_for: Annotated[str, Header()] = "127.0.0.1"):
    if x_forwarded_for != "127.0.0.1":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="IP unauthorized")

# 2. Global Dependency: Runs for EVERY route on the entire FastAPI instance
app = FastAPI(dependencies=[Depends(verify_global_api_key)])

# 3. Router-Level Dependency: Runs for all routes in this APIRouter
admin_router = APIRouter(
    prefix="/admin", 
    dependencies=[Depends(verify_admin_ip)],
    tags=["Admin"]
)

# 4. Route-Level Dependency: Runs only for this specific route
@admin_router.get("/purge-cache", dependencies=[Depends(lambda: print("Purging..."))])
async def purge_cache():
    return {"status": "Cache purged"}

app.include_router(admin_router)