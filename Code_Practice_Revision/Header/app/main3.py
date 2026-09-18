# 3. Duplicate Headers (list[str])
# Some HTTP headers appear multiple times in a single request. 
# Declaring the type as list[str] aggregates all occurrences into a single Python list.

from typing import Annotated
from fastapi import FastAPI, Header

app = FastAPI()

@app.get("/tracking")
async def track_request(
    x_tag: Annotated[list[str] | None, Header()] = None
):
    return {"tags_received": x_tag or []}



# Test Command:
# curl -H "X-Tag: staging" -H "X-Tag: build-42" http://127.0.0.1:8000/tracking