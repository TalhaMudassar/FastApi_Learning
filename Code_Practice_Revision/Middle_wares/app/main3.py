# 3. Path-Specific Filtering & Early Request Termination
# Middleware runs on all requests,
# but you can inspect request.url.path to filter logic or reject requests immediately using a custom JSONResponse without letting the request hit the endpoint.

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

app = FastAPI(title="Path & Security Filtering Middleware")

@app.middleware("http")
async def admin_security_middleware(request: Request, call_next):
    # Only enforce this check for paths starting with '/admin'
    if request.url.path.startswith("/admin"):
        token = request.headers.get("X-Admin-Secret")
        if token != "super-secret-admin-pass":
            # Terminate immediately: Endpoint will NEVER run
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "Forbidden: Invalid or missing admin credentials."}
            )

    # For all other routes, proceed normally
    response = await call_next(request)
    return response

@app.get("/public")
async def public_route():
    return {"message": "Public content accessible by anyone"}

@app.get("/admin/dashboard")
async def admin_route():
    return {"secret_data": "Top secret financial reports"}



# Test Command 1 (Public Access):
# curl http://127.0.0.1:8000/public
# # Returns: {"message": "Public content accessible by anyone"}


# Test Command 2 (Unauthorized Admin):
# curl -i http://127.0.0.1:8000/admin/dashboard
# # Returns 403 Forbidden with: {"error": "Forbidden: Invalid or missing admin credentials."}


# Test Command 3 (Authorized Admin):
# curl -H "X-Admin-Secret: super-secret-admin-pass" http://127.0.0.1:8000/admin/dashboard
# # Returns 200 OK with: {"secret_data": "Top secret financial reports"}