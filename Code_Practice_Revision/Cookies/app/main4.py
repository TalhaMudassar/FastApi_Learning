# 5. Aliases for Special Cookie Names (Hyphens & Prefixes)
# Browser cookies often use hyphens (e.g., session-token) or prefixes (e.g., __Host-Id). Because these are invalid Python variable names, map them using alias.

from typing import Annotated
from fastapi import FastAPI, Cookie

app = FastAPI()

@app.get("/track")
async def track_user(
    tracking_id: Annotated[
        str | None,
        Cookie(alias="visitor-track-id")
    ] = None
):
    return {"tracker": tracking_id}