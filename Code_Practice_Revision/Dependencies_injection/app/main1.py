# Module 1: The Modern Standard & Type Aliasing
# Instead of repeating Annotated[Type, Depends(...)] across multiple route handlers, 
# define a top-level reusable type alias.

from typing import Annotated
from fastapi import FastAPI, Depends, Query

app = FastAPI(title="Dependency Injection Basics")

# 1. Dependency definition  
async def pagination_params(
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
    size: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
) -> dict [str, int]:
    offset = (page - 1) * size
    return {"page": page, "size": size, "offset": offset}

# 2. Reusable Type Alias (Production Standard)
PaginationDep = Annotated[dict[str, int], Depends(pagination_params)]

# 3. Clean endpoint signatures
@app.get("/items")
async def list_items(pagination: PaginationDep):
    return {"endpoint": "items", "pagination": pagination}

@app.get("/users")
async def list_users(pagination: PaginationDep):
    return {"endpoint": "users", "pagination": pagination}




# Test Command:
# curl "http://127.0.0.1:8000/items?page=2&size=10"

