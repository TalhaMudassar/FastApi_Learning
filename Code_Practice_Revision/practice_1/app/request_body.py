# 1. Basic Request Body (Pydantic Model)
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name:str
    price:float
    in_stock:bool = True
    

@app.post("/items")
async def create_items(items:Item):
    return {"message":"Created","Data":items}


#------------------------------------------------------------------------

# 2. Request Body with Field Validation (Field)
# Use Pydantic's Field to enforce constraints on
# values, lengths, and numerical limits inside the request body.
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class Product(BaseModel):
    title : str = Field(..., min_length=3, max_length=50)
    description : str | None = Field(default=None, max_length=300)
    price : float = Field(..., gt=0, description="Price must be strictly positive ")
    discount : float = Field(default=0.0, ge=0.0, le=100)
    
    
@app.post("/products")
async def add_product(product:Product):
    final_price = product.price * (1 - product.discount / 100)
    return {"title": product.title, "final_price": round(final_price, 2)}



#------------------------------------------------------------------------------

# 3. Multiple Request Bodies in One Endpoint
# When declaring more than one Pydantic model parameter, FastAPI expects an outer JSON payload containing keys matching the parameter names.
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    username: str
    email: str

class Item(BaseModel):
    name: str
    price: float
    
@app.post("/purchase")
async def process_purchase(user:User,item:Item):
    return {"buyer": user.username, "bought_item": item.name}



# ------------------------------------------------------------------------
# 4. Singular Value in Request Body (Body)
# To accept a single primitive value directly from the JSON body
# instead of a query parameter, use Body().

from fastapi import FastAPI, Body
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/update-inventory")
async def update_inventory(
    item: Item,
    quantity: int = Body(..., ge=1)  # Reads "quantity" from JSON, NOT from URL
):
    return {"item": item.name, "quantity_added": quantity}


# -------------------------------------------------------------------------
# 5. Forcing an Embed Key with Body(embed=True)
# By default, a single Pydantic model expects direct JSON properties. 
# embed=True forces FastAPI to expect the model name as the root key.

from fastapi import FastAPI,Body
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name:str
    price:float
    
@app.post("/items/embedded")
async def create_embedded_item(item:Item = Body(..., embed=True)):
    return {"item_received": item}



#--------------------------------------------------------------
# 6. Nested Pydantic Models & Lists of Objects
# You can nest models inside models to handle complex relational data or sub-documents.
from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl

app = FastAPI()

class Image(BaseModel):
    url: HttpUrl
    name: str

class Article(BaseModel):
    title: str
    tags: list[str] = []
    images: list[Image] = []

@app.post("/articles")
async def create_article(article: Article):
    return {
        "article_title": article.title,
        "total_images": len(article.images),
        "tags": article.tags
    } 
    
    
    
# -----------------------------------------------------------
# 7. List as the Root Request Body
# If you want the top-level incoming JSON to be an array rather than an object,
# type hint the argument as a list of models.

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/bulk")
async def create_multiple_items(items: list[Item]):
    total_cost = sum(item.price for item in items)
    return {"items_processed": len(items), "total_cost": total_cost}


# -------------------------------------------------------------------------------
# 8. All-in-One: Path, Query, and Request Body Combined
# FastAPI automatically parses each parameter correctly based on where it is declared.
from fastapi import FastAPI, Path, Query
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.put("/items/{item_id}")
async def update_item(
    item_id: int = Path(..., ge=1, description="Resource ID in path"),
    notify: bool = Query(default=False, description="Query string flag"),
    item: Item = ...  # Request body
):
    return {
        "item_id": item_id,
        "notify_customer": notify,
        "updated_item": item
    }