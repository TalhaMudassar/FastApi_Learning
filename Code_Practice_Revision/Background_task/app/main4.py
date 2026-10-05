# Module 4: Using Starlette's Low-Level BackgroundTask with Direct Responses
# While BackgroundTasks (with an s) is standard in path operation arguments, 
# you can also return a Starlette Response object with an individual BackgroundTask (without the s).
from fastapi import FastAPI
from starlette.background import BackgroundTask
from starlette.responses import JSONResponse

app = FastAPI(title="Low-Level BackgroundTask")

def log_completion(endpoint_name: str):
    print(f"[Direct Hook] Request lifecycle completed for: {endpoint_name}")

@app.get("/custom-response")
async def custom_response_route():
    task = BackgroundTask(log_completion, endpoint_name="/custom-response")
    
    # Attach task directly to the Starlette response
    return JSONResponse(
        content={"message": "Using Starlette low-level BackgroundTask"},
        background=task
    )
    
    
    
# Test Command:
# curl http://127.0.0.1:8000/custom-response


# Immediate Response (200 OK):
# {"message": "Using Starlette low-level BackgroundTask"}


# Terminal Console Output:
# [Direct Hook] Request lifecycle completed for: /custom-response    
