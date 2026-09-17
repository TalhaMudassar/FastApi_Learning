# 4. Single Required Cookie (Without Dependencies)
# If you have a single required cookie, you don't need a Pydantic model or Depends(). Simply omit the default value:

from typing import Annotated
from fastapi import FastAPI, Cookie
app = FastAPI()

# Required cookie: no default provided
@app.get("/profile")
async def  user_profile(
    auth_token : Annotated[str,Cookie(description="JWT AUTH TOKEN")]
):
    return {"status": "authenticated", "token": auth_token}

