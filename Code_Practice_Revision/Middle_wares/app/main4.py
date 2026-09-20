# 4. Built-in Security Middleware: TrustedHostMiddleware & CORSMiddleware
# FastAPI provides standard built-in middleware classes via Starlette.
# Instead of writing custom logic, install these with app.add_middleware().

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI(title="Production Security Middleware")

# 1. TrustedHostMiddleware: Prevents HTTP Host Header attacks
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "api.myproductiondomain.com"]
)

# 2. CORSMiddleware: Controls which frontend origins can communicate with your API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://myfrontend.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"]  # Allows browsers to read this custom header
)

@app.get("/status")
async def get_status():
    return {"status": "healthy"}


#Test Valid Host:
# curl -H "Host: localhost" http://127.0.0.1:8000/status
# # Returns: {"status": "healthy"}



# Test Blocked Host:
# curl -H "Host: malicious-spoofed-site.com" http://127.0.0.1:8000/status
# # Output: Invalid host header