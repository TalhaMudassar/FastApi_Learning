# 1. Modern Annotated Pattern with Metadata (title & description)
# FastAPI officially recommends using typing.Annotated. 
# It keeps the actual default value intuitive in Python and adds OpenAPI documentation metadata.
# from typing import Annotated
# from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items/")
async def read_items(
    q: Annotated[
        str | None,
        Query(
            title="Query string",
            description="Query string for items to search in the database",
            min_length=3,
            max_length=50,
        ),
    ] = None,
):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results



# -----------------------------------------------------------------------------
# 2. Required Parameter That Can Be None
# Forces the client to explicitly pass the key in the URL, but allows its value to be empty/null.
from typing import Annotated
from fastapi import FastAPI, Query

app = FastAPI()
# Notice: no '= None' at the end, so it is strictly REQUIRED
@app.get("/items")
async def read_items(q: Annotated[str | None, Query(min_length=3)]):
    return {"q":q}



# -----------------------------------------------------------------------------
# 3. Query Parameter Lists with Default Fallback Values
# Accepts multiple values in the query string (?q=foo&q=bar),
# but falls back to a multi-element default list if none are passed.
from typing import Annotated
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items")
async def read_items(q: Annotated[list[str], Query()] = ["default_a", "default_b"]):
    return {"q": q}



#--------------------------------------------------------------------------------
# 4. Hide Parameters from Docs (include_in_schema=False)
# Lets you accept an internal query parameter (like a debug flag, feature toggle,
# or tracing token) without exposing it in the public Swagger UI schema.
from typing import Annotated
from fastapi import FastAPI, Query
app = FastAPI()

@app.get("/items/")
async def read_items(
    hidden_token : Annotated[str | None, Query(include_in_schema=False)] = None
):
    if hidden_token:
        return {"mode": "secret_access", "token": hidden_token}
    return {"mode": "public"}


        
# -----------------------------------------------------------
# 5. Custom Validation with Pydantic's AfterValidator
# When standard regex or string lengths are not enough, 
# run custom Python logic directly inside Annotated.
from typing import Annotated
from fastapi import FastAPI
from pydantic import AfterValidator

app = FastAPI()

def validate_custom_id(value:str)-> str:
    if not value.startswith(("isbn-", "imdb-")):
        raise ValueError('Invalid ID format. It must begin with "isbn-" or "imdb-"')
    return value

@app.get("/media/")
async def get_media(
    media_id = Annotated[str, AfterValidator(validate_custom_id)]
):
    return {"media_id": media_id, "status": "verified"}
# Valid Request: GET /media/?media_id=imdb-tt0371724





# -------------------------------------------------------------------------
# 6. Combining Floating-Point Numeric Checks (gt, lt)
# Enforces mathematical bounds where values are between bounds rather than
# simply greater-than-or-equal.
from typing import Annotated
from fastapi import FastAPI, Path, Query

app = FastAPI()

@app.get("/items/{item_id}")
async def read_items(
    item_id: Annotated[int, Path(title="Item ID", ge=1, le=500)],
    size: Annotated[float, Query(gt=0.0, lt=10.5)],
    ):
    return {"item_id": item_id, "size": size}
#  Valid Request: GET /items/42?size=5.75   
    

# ------------------------------------------------------------------------------
# 7. Keyword-Only Parameter Ordering (* syntax in non-Annotated code)
# If you do not use Annotated, Python requires parameters with defaults to follow parameters without defaults. 
# Placing a bare * allows non-default arguments to follow defaulted arguments cleanly.
from fastapi import FastAPI

app = FastAPI()

# '*' tells Python all subsequent arguments are keyword-only
@app.get("/items/{item_id}")
async def read_items(
    *,
    item_id : int = Path(title = "Item ID", ge=1),
    q: str     # Required parameter placed AFTER an argument with a default
):
    return {"item_id": item_id, "q": q}
# Valid Request: GET /items/10?q=search_term




# ----------------------------------------------------------------
# 8. Strict Query Parameter Models (extra = "forbid")
# Introduced in FastAPI 0.115.0: using model_config = {"extra": "forbid"}
# stops clients from passing unwanted or misspelled query parameters.
from typing import Annotated, Literal
from fastapi import FastAPI, Query
from pydantic import BaseModel, Field

app = FastAPI()
class FilterParams(BaseModel):
    model_config = {"extra": "forbid"}

    limit: int = Field(default=10, gt=0, le=100)
    offset: int = Field(default=0, ge=0)
    order_by: Literal["created_at", "updated_at"] = "created_at"
    
@app.get("/items/")
async def read_items(filters: Annotated[FilterParams, Query()]):
    return filters.model_dump()
# Valid Request: GET /items/?limit=20&offset=0&order_by=created_at
    