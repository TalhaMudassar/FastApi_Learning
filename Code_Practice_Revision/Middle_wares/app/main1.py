# 1. Basic HTTP Middleware (Process Timing & Custom Headers)
# This is the standard @app.middleware("http") pattern from the official docs.
# It calculates exact execution time using time.perf_counter() and attaches it to the response headers.

import time
from fastapi import FastAPI,Request

app = FastAPI(title="Timing Middlware Demo")

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"]  = f"{process_time:.6f}s"
    
    return response


@app.get("/items")
async def read_items():
    return {"items": ["keyboard", "mouse", "monitor"]}