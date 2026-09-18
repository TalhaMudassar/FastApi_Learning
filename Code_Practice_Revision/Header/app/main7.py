# 7. Returning Custom Response Headers (Response)
# In production, APIs often return custom headers back to the client (such as execution duration, rate limits, or trace IDs).

from fastapi import FastAPI, Response
import time

app = FastAPI()

@app.get("/data-with-headers")
async def send_response_headers(response: Response):
    start_time = time.perf_counter()
    
    # Payload processing
    data = {"status": "success", "items": [1, 2, 3]}
    
    duration = time.perf_counter() - start_time
    
    # Set custom response headers
    response.headers["X-Process-Time"] = f"{duration:.6f}"
    response.headers["X-API-Version"] = "1.0.0"
    
    return data



# Test Command (Viewing Response Headers with -i):
# curl -i http://127.0.0.1:8000/data-with-headers