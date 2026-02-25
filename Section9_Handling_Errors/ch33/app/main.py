from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# ==================================================
# Fake database
# ==================================================
items = {
    "apple": "A juicy fruit",
    "banana": "A yellow delight"
}

# ==================================================
# 1️⃣ Custom Exception Class
# ==================================================
# Create your own exception for business logic
class FruitException(Exception):
    def __init__(self, fruit_name: str):
        self.fruit_name = fruit_name

# ==================================================
# 2️⃣ Exception Handler
# ==================================================
# Link the exception class with a handler
@app.exception_handler(FruitException)
async def fruit_exception_handler(request: Request, exc: FruitException):
    """
    Returns a JSON response when FruitException is raised.
    - status_code: 418 (I'm a teapot 😉 example)
    - message: dynamic message based on fruit_name
    """
    return JSONResponse(
        status_code=418,
        content={"message": f"{exc.fruit_name} is not a valid fruit!"}
    )

# ==================================================
# 3️⃣ Endpoint that uses the custom exception
# ==================================================
@app.get("/fruits/{fruit_name}")
async def read_fruits(fruit_name: str):
    """
    Check if fruit_name exists in items.
    If not, raise FruitException to trigger custom handler.
    """
    if fruit_name not in items:
        raise FruitException(fruit_name=fruit_name)
    return {"fruit": fruit_name, "description": items[fruit_name]}
