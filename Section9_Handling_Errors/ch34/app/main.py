from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse

app = FastAPI()

# ==================================================
# Fake database (not used here, just for context)
# ==================================================
items = {
    "apple": "A juicy fruit",
    "banana": "A yellow delight"
}

# ==================================================
# 1️⃣ Override FastAPI's default validation error handler
# ==================================================
# By default, FastAPI returns JSON for validation errors.
# Here, we override it to return a plain text response instead.
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    This function will catch all RequestValidationError exceptions
    (e.g., when a path/query/body parameter has the wrong type).
    
    Instead of returning JSON, we return plain text with status code 400.
    """
    return PlainTextResponse(
        str(exc),   # Convert the validation error details to string
        status_code=400
    )

# ==================================================
# 2️⃣ Endpoint to demonstrate validation error
# ==================================================
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    """
    item_id must be an integer.
    If the user sends a non-integer value (e.g., /items/abc),
    FastAPI will raise RequestValidationError, which will be
    handled by our custom handler above.
    """
    return {"item_id": item_id}
