# 2. HTTPSRedirectMiddleware (Strict Transport Security)
# Forces all plain HTTP traffic to redirect to secure HTTPS via 307 Temporary Redirect.

from fastapi import FastAPI
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app = FastAPI(title="HTTPS Enforcement")

# Production only: Keep disabled in local development unless running with SSL certs
app.add_middleware(HTTPSRedirectMiddleware)

@app.get("/secure-endpoint")
async def secure_endpoint():
    return {"message": "Transmitted over secure channel"}




# Test Command (via plain HTTP):
# curl -i http://127.0.0.1:8000/secure-endpoint

# Expected Response:
# HTTP/1.1 307 Temporary Redirect
# location: https://127.0.0.1:8000/secure-endpoint