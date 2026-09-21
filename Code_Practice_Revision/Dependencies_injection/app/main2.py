# Module 2: Dependency Hierarchy & Shared Execution Cache (use_cache)
# When dependencies branch into a tree (e.g., get_db is needed by both get_current_user and the route handler), 
# FastAPI computes get_db() once per HTTP request and caches the value in memory.

import uuid
from typing import Annotated
from fastapi import FastAPI, Depends

app = FastAPI(title="Hierarchical Caching Demo")

# Simulating a stateful database or transaction object
async def get_db_session() -> str:
    session_id = f"db_session_{uuid.uuid4().hex[:6]}"
    print(f"Creating: {session_id}")
    return session_id


# Sub-dependency 1: depends on get_db_session
async def get_current_user(
    db: Annotated[str, Depends(get_db_session)]
) -> dict[str, str]:
    return {"username": "talha", "db_used": db}



# Sub-dependency 2: depends on get_current_user (which also needed get_db_session)
async def check_admin_role(
    user: Annotated[dict[str, str], Depends(get_current_user)]
) -> dict[str, str]:
    return {"user": user["username"], "role": "admin", "db_used": user["db_used"]}



@app.get("/dashboard")
async def dashboard(
    user_role: Annotated[dict[str, str], Depends(check_admin_role)],
    db: Annotated[str, Depends(get_db_session)],  # Re-requests get_db_session!
):
    # Because use_cache=True (default), both user_role and this endpoint share the EXACT SAME session_id
    return {
        "status": "success",
        "role_info": user_role,
        "endpoint_db_instance": db,
        "is_same_session": user_role["db_used"] == db
    }