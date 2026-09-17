# 2. Setting Cookies with Security Flags (Response.set_cookie)
# Reading a cookie is only half the battle;
# the server must first tell the browser to store it using response.set_cookie().

from fastapi import FastAPI, Response

app = FastAPI()

@app.post("/auth/login")
async def login(response: Response):
    # Set the cookie in client's browser
    response.set_cookie(
        key="session_id",
        value="secret_token_123456",
        max_age=3600,           # Lifetime in seconds (1 hour)
        httponly=True,          # Prevents JavaScript reading (Stops XSS theft)
        secure=True,            # Only transmitted over HTTPS
        samesite="lax"          # Defends against CSRF attacks
    )
    return {"message": "Cookie set successfully and securely"}

