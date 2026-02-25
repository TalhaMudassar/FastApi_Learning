from fastapi import FastAPI, HTTPException

app = FastAPI()

# Fake database (dictionary)
items = {
    "apple": "A juicy fruit",
    "banana": "A yellow delight"
}

# ==================================================
# Handling Errors with HTTPException
# + Adding Custom Headers in Error Response
# ==================================================

@app.get("/items/{item_id}")
async def get_item(item_id: str):
    # Check if item exists in our "database"
    if item_id not in items:
        # If item is not found, raise an HTTPException
        raise HTTPException(
            status_code=404,                 # HTTP status code
            detail="Item not found",          # Error message shown to client
            headers={                        # Custom headers in response
                "x-error-type": "item_missing"
            }
        )

    # If item exists, return it
    return {
        "item": item_id,
        "description": items[item_id]
    }
