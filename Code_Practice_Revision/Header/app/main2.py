# 2. Strictly Required Header (X-API-Key)
# Omitting a default value marks the header as required. 
# If the client misses it, FastAPI returns an automatic 422 Unprocessable Entity.

from typing import Annotated
from fastapi import FastAPI, Header

app = FastAPI()

@app.get("/secure-data")
async def get_secure_data(
    x_api_key: Annotated[str, Header(description="Required client API key")]
):
    return {"status": "authorized", "key_used": x_api_key}



# Valid Test Command:
# curl -H "X-API-Key: live_secret_9988" http://127.0.0.1:8000/secure-data