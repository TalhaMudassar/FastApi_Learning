from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import Annotated
app = FastAPI()


class Product(BaseModel):
    name: str
    price: float
    stock: str | None = None


class Seller(BaseModel):
    username: str
    fullname: str | None = None

@app.post("/product")
async def create_product(product: Product , seller: Seller):
    return{
        "Product" : product,
        "seller" : seller
    }


# Make body optional
@app.post("/product")
async def create_product(product:Product, seller:Seller|None = None):
    return{
        "Product" : product,
        "seller" : seller
    }


# Singular values in body
@app.post("/product")
async def create_product(
    product: Product,
    seller: Seller,
    scr_key: Annotated[str, Body()]
):
    return {"product": product, "seller": seller, "scr_key": scr_key}


## Embed  a single body parameter
# Wihout Embed
@app.post("/product")
async def create_product(product: Product):
    return{
        "Product" : product
    }
    
# With Embed
@app.post("/product")
async def create_product(product:Annotated[Product ,Body(embed=True)]):
    return {
        "product" : product
        
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
@app.post("/product/embed")
async def create_product_embed(
    product: Annotated[Product, Body(embed=True)]
):
    return {"product": product}


    
    