from fastapi import FastAPI,status,Query
from typing import Annotated
from pydantic import AfterValidator
app = FastAPI()
PRODUCTS = [
    {
        "id": 1,
        "title": "Ravan Backpack",
        "price": 109.95,
        "description": "Perfect for everyday use and forest walks."
    },
    {
        "id": 2,
        "title": "Slim Fit T-Shirts",
        "price": 22.3,
        "description": "Comfortable, slim-fitting casual shirts."
    },
    {
        "id": 3,
        "title": "Cotton Jacket",
        "price": 55.99,
        "description": "Great for outdoor activities and gifting."
    }
]

#BASIC QUERY
# @app.get("/product")
# async def products(search:str | None = None):
#     if search:
#         search_lower = search.lower()
#         return[
#             product for product in PRODUCTS
#             if search_lower in product["title"].lower()
#         ]
#     return PRODUCTS
                

##  OLD mthod 
#basic query
# @app.get("/product")
# async def products(search:str | None = Query(default=None, max_length=10)):
#     if search:
#         search_lower = search.lower()
#         return[
#             product for product in PRODUCTS
#             if search_lower in product["title"].lower()
#         ]
#     return PRODUCTS


# latest method wth anotated
# @app.get("/product")
# async def products(search: Annotated[str | None , Query(max_length=10)]=None ):
#     if search:
#         search_lower = search.lower()
#         return[
#             product for product in PRODUCTS
#             if search_lower in product["title"].lower()
#         ]
#     return PRODUCTS


# latest method wth anotated more methods 
# @app.get("/product/")
# async def products(search: Annotated[str , Query(min_length=4)]):
#     if search:
#         search_lower = search.lower()
#         return[
#             product for product in PRODUCTS
#             if search_lower in product["title"].lower()
#         ]
#     return PRODUCTS

#Multiple search Term
# @app.get("/product/")
# async def products(search: Annotated[list[str] | None , Query()]= None):
#     if search:
#         filtered_item = []
#         for product in PRODUCTS:
#             for s in search:
#                 if s.lower() in product["title"].lower():
#                     filtered_item.append(product)
#         return filtered_item
#     return PRODUCTS

#alias data
# @app.get("/product/")
# async def products(search: Annotated[list[str] | None , Query(alias="q")]= None):
#     if search:
#         filtered_item = []
#         for product in PRODUCTS:
#             for s in search:
#                 if s.lower() in product["title"].lower():
#                     filtered_item.append(product)
#         return filtered_item
#     return PRODUCTS

# #add title and description
# @app.get("/product/")
# async def products(search: Annotated[list[str] | None , Query(alias="q", title="Here are the title " , description="Here are the description")]= None):
#     if search:
#         filtered_item = []
#         for product in PRODUCTS:
#             for s in search:
#                 if s.lower() in product["title"].lower():
#                     filtered_item.append(product)
#         return filtered_item
#     return PRODUCTS


#add title and description
# @app.get("/product/")
# async def products(search: Annotated[list[str] | None , Query(alias="q", title="Here are the title " , description="Here are the description")]= None):
#     if search:
#         filtered_item = []
#         for product in PRODUCTS:
#             for s in search:
#                 if s.lower() in product["title"].lower():
#                     filtered_item.append(product)
#         return filtered_item
#     return PRODUCTS


#Custom Validator
def check_valid_id(id : str):
    if not id.startswith("prod-"):
        raise ValueError("ID must start with prod-")
    
@app.get("/products/")
async def functionn(id: Annotated[str | None , AfterValidator(check_valid_id)]):
    if id:
        return {"id" : id, "messages" : "Valid product ID"}
    return {"messages" :  "No id provided"}
