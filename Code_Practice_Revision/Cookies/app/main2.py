# 3. Deleting Cookies (Response.delete_cookie)
# To log a user out or clear state, tell the browser to expire the cookie immediately.

from fastapi import FastAPI, Response

app = FastAPI()

@app.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="session_id",
        httponly=True,
        secure=True,
        samesite="lax"
    )
    return {"message": "Session cookie cleared"}
