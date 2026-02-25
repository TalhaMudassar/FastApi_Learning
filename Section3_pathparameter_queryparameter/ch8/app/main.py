from fastapi import FastAPI
from enum import Enum
app = FastAPI()
# =====================================
# PREDEFINED PATH PARAMETER VALUES
# =====================================
# Enum restricts the allowed values in path parameters
class ProductCategories(str, Enum):
    books = "Books"
    clothing = "Clothing"
    electronics = "Electronics"

@app.get("/product/{category}")
async def get_product(category: ProductCategories):
    """
    category can ONLY be one of:
    - Books
    - Clothing
    - Electronics

    Any other value → 422 Validation Error
    """

    #  Recommended and clean way
    if category == ProductCategories.books:
        message = "Books are awesome!"

    elif category == ProductCategories.clothing:
        message = "Fashion trends here!"

    elif category == ProductCategories.electronics:
        message = "Latest gadgets are available!"

    return {
        "category": category,
        "message": message
    }

# we do also work with these different way------
    # category == ProductCatergories.books:
    # category.value == "Clothing":
    # category == ProductCatergories.electronics.value:    
        
        
        