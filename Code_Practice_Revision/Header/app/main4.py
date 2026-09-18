# 4. Disabling Underscore Conversion (convert_underscores=False)
# By default, FastAPI converts underscores (_) to hyphens (-). 
# If your client, proxy, or legacy system sends literal underscores in headers, disable conversion explicitly.
from fastapi import FastAPI, Header
from typing import Annotated
app  = FastAPI()

@app.get("/legacy")
async def read_legacy_header(
    custom_system_id : Annotated[
        str | None,
        Header(convert_underscores=False)
    ] = None
):
    # Expects literal HTTP header: "custom_system_id" (not "custom-system-id")
    return {"custom_system_id": custom_system_id}


# Test Command:
# curl -H "custom_system_id: sys_alpha_1" http://127.0.0.1:8000/legacy
