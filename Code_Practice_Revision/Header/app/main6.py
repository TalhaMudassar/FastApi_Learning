# 6. Strict Header Model with extra="forbid"
# Enforcing extra="forbid" ensures that incoming requests are rejected
# if any unexpected headers are received in the model's scope.

from typing import Annotated
from fastapi import FastAPI, Header
from pydantic import BaseModel

app = FastAPI()

class StrictGatewayHeaders(BaseModel):
    model_config = {"extra": "forbid"}

    x_tenant_id: str
    x_client_version: str

@app.get("/tenant/data")
async def tenant_data(
    headers: Annotated[StrictGatewayHeaders, Header()]
):
    return headers.model_dump()



# Valid Test Command:
# curl -H "X-Tenant-Id: acme_corp" -H "X-Client-Version: 2.4.0" -H "Host:" -H "User-Agent:" -H "Accept:" http://127.0.0.1:8000/tenant/data