# Module 4: Class-Based Dependencies with __call__ Parameterization
# Classes are effective for configurable, parameterized dependencies (e.g., checking permissions, enforcing rate limits, or filtering data).
from typing import Annotated
from fastapi import FastAPI, Depends, Header, HTTPException, status

app = FastAPI(title="Class Dependency Engine")

# Parameterized Security Guard
class RoleChecker:
    def __init__(self, required_role: str):
        self.required_role = required_role

    def __call__(self, x_role: Annotated[str, Header()] = "viewer") -> str:
        if x_role != self.required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires '{self.required_role}' role (provided: '{x_role}')",
            )
        return x_role
    
    

# Instantiate reusable instances with different configurations
require_admin = RoleChecker(required_role="admin")
require_editor = RoleChecker(required_role="editor")

@app.get("/admin/settings")
async def admin_settings(role: Annotated[str, Depends(require_admin)]):
    return {"message": "Welcome, Administrator."}

@app.get("/editor/drafts")
async def editor_drafts(role: Annotated[str, Depends(require_editor)]):
    return {"message": "Drafts accessible."}





# Test Denied:
# curl -i -H "x-role: viewer" http://127.0.0.1:8000/admin/settings
# # Output: 403 Forbidden -> "Access denied: Requires 'admin' role (provided: 'viewer')"

# Test Allowed:
# curl -i -H "x-role: admin" http://127.0.0.1:8000/admin/settings
# # Output: 200 OK -> {"message": "Welcome, Administrator."}