# 1. Optional Request Body (Item | None = None)
# Allows the client to send an empty HTTP body (or null) without raising a validation error.

from typing import Annotated
from fastapi import FastAPI, Path
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    description: str | None = None

@app.put("/items/{item_id}")
async def update_item(
    item_id: Annotated[int, Path(ge=1)],
    item: Item | None = None,  # Optional body
):
    if item is None:
        return {"item_id": item_id, "status": "no data provided"}
    return {"item_id": item_id, "item": item}

# HTTP Method & URL: PUT /items/42



# ---------------------------------------------------------------------
# 3. Arbitrary Dict Body with Automatic Key Type Coercion (dict[int, float])
# In raw JSON, object keys must always be strings. However, 
# typing the body as dict[int, float] tells Pydantic to automatically parse those string keys into native Python integers.

from fastapi import FastAPI

app = FastAPI()

@app.post("/index-weights/")
async def calculate_weights(weights: dict[int, float]):
    # Python receives native int keys and float values
    total = sum(weights.values())
    return {
        "received_weights": weights,
        "key_types": [type(k).__name__ for k in weights.keys()],
        "total_sum": total,
    }
# HTTP Method & URL: POST /index-weights/



# ------------------------------------------------------------------------
# 4. Special String Types: Pydantic's HttpUrl
# Ensures that string fields match valid URL schemes (requires http:// or https:// with a valid host).

from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl

app = FastAPI()

class Image(BaseModel):
    url: HttpUrl
    name: str

@app.post("/images/")
async def add_image(image: Image):
    return {"url_host": image.url.host, "full_url": str(image.url)}


# HTTP Method & URL: POST /images/

# Valid Input JSON Body:
# JSON
# {
#   "url": "https://images.unsplash.com/photo-example.jpg",
#   "name": "Cover Image"
# }

# Expected Output:
# JSON

# {
#   "url_host": "images.unsplash.com",
#   "full_url": "https://images.unsplash.com/photo-example.jpg"
# }

# Invalid Input JSON Body:
# JSON

# {
#   "url": "not-a-valid-url",
#   "name": "Broken Link"
# }

# Error Output (422 Unprocessable Entity):
# JSON

# {
#   "detail": [
#     {
#       "type": "url_parsing",
#       "loc": ["body", "url"],
#       "msg": "Input should be a valid URL, relative URL without a base",
#       "input": "not-a-valid-url"
#     }
#   ]
# }




# -------------------------------------------------------------------
# 5. Multi-Level Deep Nesting (Offer -> Item -> Image)
# A parent model can contain a list of child models, which in 
# turn can contain lists of sub-child models.
from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl

app = FastAPI()

class Image(BaseModel):
    url: HttpUrl
    name: str

class Item(BaseModel):
    name: str
    price: float
    images: list[Image] = []

class Offer(BaseModel):
    title: str
    discount_percentage: float
    items: list[Item]

@app.post("/offers/")
async def create_offer(offer: Offer):
    total_images = sum(len(item.images) for item in offer.items)
    return {
        "offer_title": offer.title,
        "total_items": len(offer.items),
        "total_images_across_items": total_images,
    }
