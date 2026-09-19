from typing import Any
from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, EmailStr

app = FastAPI()

# ==============================================================================
# 0. MODELS FOR TESTING
# ==============================================================================

class BaseUser(BaseModel):
    username: str
    email: EmailStr
    full_name: str | None = None

class UserIn(BaseUser):
    password: str  # Plaintext password (sensitive)

class UserOut(BaseModel):
    username: str
    email: EmailStr
    full_name: str | None = None
    
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float = 10.5        # Field with a default value
    tags: list[str] = []     # Field with default empty list


# Fake In-Memory Databases
items_db = {
    "foo": {"name": "Foo", "price": 50.2},  # tax and tags are UNSET
    "bar": {"name": "Bar", "description": "Bar fighter", "price": 62.0, "tax": 20.2},
    "baz": {"name": "Baz", "description": None, "price": 50.2, "tax": 10.5, "tags": []},
}


# ==============================================================================
# 1. MODERN PYTHON RETURN TYPE ANNOTATION (Single Object & List)
# ==============================================================================
# FastAPI automatically creates response_model from the '->' annotation.
# It automatically filters extra fields and serializes the JSON.

@app.get("/item-type", response_model_by_alias=True)
async def get_item_with_type() -> Item:
    # Notice: 'extra_secret' is returned, but FastAPI STRIPS it!
    return {
        "name": "Wireless Headphones",
        "price": 99.99,
        "extra_secret": "internal_server_debug_info"
    }
# GET /item-type
# Output: {"name": "Wireless Headphones", "description": null, "price": 99.99, "tax": 



# ---------------------------------------------------------------------------------
@app.get("/items-list")
async def get_items_list() -> list[Item]:
    return [
        Item(name="Hammer", price=10.5),
        Item(name="Nail Set", price=3.0)
    ]
# GET /items-list
# Output: [{"name": "Hammer", ...}, {"name": "Nail Set", ...}]





# ==============================================================================
# 2. FILTERING SENSITIVE DATA USING CLASS INHERITANCE
# ==============================================================================
# UserIn inherits from BaseUser and adds 'password'.
# Typing '-> BaseUser' keeps mypy/IDE happy while stripping 'password' from response!

@app.post("/register-safe")
async def register_user(user: UserIn) -> BaseUser:
    # Database saves 'user' with password, but response ONLY contains BaseUser fields
    return user
# POST /register-safe
# Input:  {"username": "johndoe", "email": "john@example.com", "password": "supersecretpassword123"}
# Output: {"username": "johndoe", "email": "john@example.com", "full_name": null}




# ==============================================================================
# 3. EXPLICIT response_model PARAMETER + -> Any
# ==============================================================================
# Used when returning raw dicts/database records where Python type checkers
# would complain if you annotated the function with '-> UserOut'.

@app.post("/user-response-model", response_model=UserOut)
async def create_user_explicit(user: UserIn) -> Any:
    # Returning user (which has password), but response_model=UserOut strips it
    return user
# Output: {"username": "johndoe", "email": "john@example.com", "full_name": null}



# ==============================================================================
# 4. DISABLING RESPONSE VALIDATION & FILTERING (response_model=None)
# ==============================================================================
# Turns OFF response validation completely. Returns raw data as-is.

@app.get("/raw-unfiltered", response_model=None)
async def get_raw_data() -> Any:
    return {
        "status": "raw",
        "unfiltered_secret": "visible_to_client",
        "timestamp": 12345678
    }
# GET /raw-unfiltered
# Output: {"status": "raw", "unfiltered_secret": "visible_to_client", "timestamp": 12345678}






# ==============================================================================
# 5. RETURNING DIRECT Response OBJECTS & SUBCLASSES
# ==============================================================================
# When returning custom responses (Redirects, Files, HTML, or raw JSONResponse),
# annotate the return type with Response or its subclass.

@app.get("/teleport")
async def teleport_user(teleport: bool = False) -> Response:
    if teleport:
        return RedirectResponse(url="https://fastapi.tiangolo.com")
    return JSONResponse(content={"message": "You stayed in place."})
# GET /teleport?teleport=false -> {"message": "You stayed in place."}
# GET /teleport?teleport=true  -> Redirects browser to fastapi docs







# ==============================================================================
# 6. EXCLUDING UNSET FIELDS (response_model_exclude_unset=True)
# ==============================================================================
# Only fields EXPLICITLY set in the data are returned.
# Default values that were not explicitly set (like default tax or empty tags) are omitted.

@app.get("/items/exclude-unset/{item_id}", response_model=Item, response_model_exclude_unset=True)
async def read_item_exclude_unset(item_id: str):
    # For "foo", tax=10.5 and tags=[] were NOT set in the dictionary
    return items_db.get(item_id, {})
# GET /items/exclude-unset/foo
# Output: {"name": "Foo", "price": 50.2}  <-- Notice: 'tax', 'tags', 'description' are NOT in response!







# ==============================================================================
# 7. EXCLUDE DEFAULTS & EXCLUDE NONE
# ==============================================================================
# response_model_exclude_defaults=True -> Omits fields whose values match their default.
# response_model_exclude_none=True     -> Omits fields whose value evaluates to None.

@app.get("/items/exclude-none/{item_id}", response_model=Item, response_model_exclude_none=True)
async def read_item_exclude_none(item_id: str):
    return items_db.get(item_id, {})
# GET /items/exclude-none/baz
# Output: {"name": "Baz", "price": 50.2, "tax": 10.5, "tags": []} <-- 'description: null' was removed!

