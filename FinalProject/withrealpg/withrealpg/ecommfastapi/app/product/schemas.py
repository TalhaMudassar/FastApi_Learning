from pydantic import BaseModel, Field

################# Category ###################
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    name: str
    model_config = {
        "from_attributes": True
    }

################ Product ##################
class ProductBase(BaseModel):
    title: str
    description: str | None = None
    price: float = Field(gt=0)
    stock_quantity: int = Field(ge=0)

class ProductCreate(ProductBase):
    category_ids: list[int] | None = None

class ProductOut(ProductBase):
    id: int
    title: str
    description: str
    slug: str
    price: float
    categories: list[CategoryOut] = []
    image_url: str | None = None
    model_config = {
        "from_attributes": True
    }

class PaginatedProductOut(BaseModel):
    total: int
    page: int
    limit: int
    items: list[ProductOut]

class ProductUpdate(BaseModel):
    title : str | None = None
    description : str | None = None
    price : float | None = None
    stock_quantity : int | None = None
    image_url : str | None = None
    category_ids: list[int] | None = None
    model_config = {
        "from_attributes": True
    }
