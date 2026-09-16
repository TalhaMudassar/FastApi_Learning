from fastapi import FastAPI

app = FastAPI()


# 1. Basic Optional Query Parameter (with Default Value)
# Any primitive argument not in the route path becomes a query parameter.
@app.get("/items")
async def get_items(limit: int=10):
    return {"limit are :": limit}


# 2. Nullable Optional Query Parameter 
# Accepts a value or defaults to None if the client omits it.
@app.get("/items_search")
async def get_items(search:str | None = None):
    return {"Search":search}



# 3. Required Query Parameter
# Omitting a default value forces the client to supply the parameter; 
# missing it triggers a 422 Unprocessable Entity.
@app.get("/items_necess")
async def necessary_items(category:str):
    return{"category given are ":category}



# 4. Boolean Flags with Flexible Parsing
# FastAPI parses true, 1, on, yes (case-insensitive) as True, and false, 0, off, no as False.
# URL: /products?in_stock=true OR /products?in_stock=1
@app.get("/products")
async def filter_stock(in_stock:bool=False):
    return {"in_stock":in_stock}




# 5. String Constraints (Length, Regex, & Descriptions) with Query()
# Use Query() to enforce string length and pattern matching.

from fastapi import Query

@app.get("/search")
async def search(
    q:str = Query(
        ...,
        min_length=3,
        max_length=20,
        pattern=r"^[a-zA-Z0-9_]+$",
        description="Search term without spaces",
    )
):
    return {"query":q}



# 6. Numeric Constraints (Ranges) with Query()
# Enforce minimums and maximums using ge (>=), gt (>), le (<=), and lt (<).
# URL: /products?page=2&size=50
@app.get("/products_new")
async def paginate(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
):
    return {"page": page, "size": size}


# 7. Multiple Values / Lists (Arrays)
# Accept multiple occurrences of the same key in the URL.
# URL: /filter?tag=electronics&tag=deals&tag=clearance

@app.get("/filter")
async def filter_items(tag: list[str] = Query(default=[])):
    return {"tags": tag}


# 8. Aliases and Disallowed Python Variable Names
# Query keys containing hyphens (e.g., item-id) or 
# reserved keywords must be mapped via alias.

# URL: /items_neww?item-category=books
@app.get("/items_neww")
async def read_items(
    #Match the hyphen from your URL in the alias
    category: str = Query(..., alias="item-category")
):
    return {"category": category}






# 9. Predefined Choices using Python Enum
# Limits incoming queries to an explicit set of options.
from enum import Enum
class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"
# URL: /catalog?order=desc (any other value raises a 422 error)
@app.get("/catalog")
async def catalog(order: SortOrder = SortOrder.asc):
    return {"sort_order": order.value}
    
