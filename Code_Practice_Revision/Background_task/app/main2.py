# Module 2: Background Tasks via Dependency Injection (Multi-Level Merge)
# One of FastAPI's core design advantages: dependencies and sub-dependencies can accept BackgroundTasks parameters. FastAPI merges all tasks added across dependencies
# and the final endpoint into one queue executed sequentially upon response completion.

from typing import Annotated
from fastapi import FastAPI, BackgroundTasks, Depends, Header

app = FastAPI(title="DI Merged Background Tasks")

def audit_log(event_type: str, detail: str):
    with open("audit.log", "a", encoding="utf-8") as f:
        f.write(f"AUDIT [{event_type}]: {detail}\n")

# Dependency that queues an audit entry
async def track_client_request(
    background_tasks: BackgroundTasks,
    user_agent: Annotated[str | None, Header()] = None
):
    # Task 1: Scheduled inside the dependency
    background_tasks.add_task(audit_log, "REQUEST_HEADER", f"User-Agent: {user_agent}")
    return {"user_agent": user_agent}

@app.post("/order/{order_id}")
async def place_order(
    order_id: int,
    background_tasks: BackgroundTasks,
    client_info: Annotated[dict, Depends(track_client_request)]
):
    # Task 2: Scheduled inside the endpoint function
    background_tasks.add_task(audit_log, "ORDER_CREATED", f"OrderId: {order_id}")
    
    return {"status": "Order Placed", "order_id": order_id}




# Test Command:
# curl -X POST "http://127.0.0.1:8000/order/10042" -H "User-Agent: TerminalCurl/8.0"


# Immediate Response (200 OK):
# {"status": "Order Placed", "order_id": 10042}


# Log Output (audit.log):
# AUDIT [REQUEST_HEADER]: User-Agent: TerminalCurl/8.0
# AUDIT [ORDER_CREATED]: OrderId: 10042