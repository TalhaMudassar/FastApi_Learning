# 1. Basic & Optional Header (User-Agent)
# FastAPI automatically parses user_agent into the HTTP standard header User-Agent. 
# Setting = None makes it optional.

from typing import Annotated
from fastapi import FastAPI, Header

app = FastAPI()

@app.get("/client-info")
async def get_client_info(
    user_agent: Annotated[str | None, Header()] = None
):
    return {"User_Agent": user_agent or "Unknown"}

# Test Command:
# curl -H "User-Agent: Mozilla/5.0" http://127.0.0.1:8000/client-info
     