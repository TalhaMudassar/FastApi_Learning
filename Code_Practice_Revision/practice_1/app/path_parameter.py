# path parameter
from fastapi import FastAPI
from fastapi import Path
app = FastAPI()


# 1. Basic Path Parameter
@app.get("/product/{product_id}")
async def get_product(product_id:str):
    return {"response":"All products"}


# 2. Path Parameter with Type Conversion
# Adding a type hint forces FastAPI to parse and validate the input (returns a 422 
# Unprocessable Entity if not an integer).

@app.get("/users/{user_id}")
async def get_users(user_id:int):
    return {"user_id": user_id, "type": type(user_id).__name__}



# 3. Multiple Path Parameters
# You can declare multiple path parameters in the same URL;
# the order in the function signature does not matter.
@app.get("/users/{user_id}/orders/{order_id}")
async def get_user_order(user_id:int,order_id:int):
    return {"user_id": user_id, "order_id": order_id}



# 4. Fixed Paths vs. Path Parameters (Route Order Matters)
# Static routes must be defined before dynamic path parameter routes; otherwise, 
# the static path gets captured by the dynamic parameter.
# 1. Put the static route FIRST:
@app.get("/users/me")
async def get_current_user():
    return {"user": "Current logged-in user"}

# 2. Put the dynamic path parameter SECOND:
@app.get("/users/{user_id}")
async def get_user_by_id(user_id: str):
    return {"user_id": user_id}



# 6. String Validation & Regex with Path()
# Enforce string constraints like character length or regex patterns.
@app.get("/sku/{sku_code}")
async def get_by_sku(
    sku_code: str = Path(
        ...,
        min_length=6,
        max_length=10,
        pattern="^[A-Z]{3}-[0-9]{4}$"
    )
):
    return {"code are ": sku_code}




# 7. Predefined Choices using Python Enum
# Restricts the path parameter to a fixed list of allowed values.
from enum import Enum
class ModelName(str,Enum):
    alexnet="alexnet",
    resnet="resnet",
    lenet="lenet"
  
# URL: /models/resnet (any other value raises a 422 error)
@app.get("/models/{model_name}")
async def get_model(model_name:ModelName):
    return {"model_name":model_name.value}




# 8. Path-Containing Path Parameters (:path converter)
# Standard path parameters match only up to the next /. 
# Use the :path modifier to capture an entire file path containing multiple slashes.
@app.get("/files/{file_path:path}")
async def read_file(file_path:str):
    return {"file_path":file_path}  





# . Combining Path, Query, and Body Parameters
# FastAPI automatically distinguishes each parameter type based on 
# where and how it is declared:
@app.get("/items/{items_id}")
async def update_item(
    items_id:int=Path(..., ge=1),
    notify: bool = False,
    item_data: bool = False
):
    return{"items_id":items_id, "notify":notify,"item_data":item_data}






## UUID BASIC IMPLEMENATATION
from uuid import UUID
from fastapi import FastAPI

app = FastAPI()

# Example valid URL: /items/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
@app.get("/items/{item_id}")
async def read_item(item_id: UUID):
    return {
        "item_id": item_id,
        "python_type": str(type(item_id)),  # Returns <class 'uuid.UUID'>
        "version": item_id.version           # Access native UUID properties
    }