# 5. Header Parameter Models (FastAPI ≥ 0.115.0)
# Instead of declaring multiple individual headers or manual dependencies, 
# extract all related headers directly into a Pydantic model using Annotated[Model, Header()].

from typing import Annotated
from fastapi import FastAPI, Header
from pydantic import BaseModel, Field

app = FastAPI()

class CommonHeaders(BaseModel):
    # Required standard header
    host: str
    
    # Auto-converts from Save-Data to save_data
    save_data: bool = False
    
    # Optional headers
    if_modified_since: str | None = None
    x_trace_id: str | None = Field(default=None, description="Request trace ID")
    
    # Duplicate headers gathered as list
    x_tag: list[str] = []

@app.get("/audit")
async def audit_request(
    headers: Annotated[CommonHeaders, Header()]
):
    return {
        "host": headers.host,
        "save_data_mode": headers.save_data,
        "trace_id": headers.x_trace_id,
        "tags": headers.x_tag
    }
    
    
    
# Test Command:
# curl -H "Host: api.example.com" -H "Save-Data: true" -H "X-Trace-Id: trace-8812" -H "X-Tag: production" -H "X-Tag: us-east" http://127.0.0.1:8000/audit