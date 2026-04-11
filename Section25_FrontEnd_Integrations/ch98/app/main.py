from fastapi import FastAPI, Request,Form
from contextlib import asynccontextmanager
from app.db.config import create_tables, SessionDep
from app.product.services import *
from app.product.models import * 
# HTML response
from fastapi.responses import HTMLResponse, RedirectResponse

# Static files
from fastapi.staticfiles import StaticFiles

# Jinja2
from fastapi.templating import Jinja2Templates

# 1. Import Path
from pathlib import Path

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(lifespan=lifespan)

# 2. Define the base directory (this resolves dynamically to your 'app' folder)
BASE_DIR = Path(__file__).resolve().parent

# 3. Mount templates using the absolute path
template = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# 4. Mount static files using the absolute path (to prevent your CSS from breaking next!)
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


@app.get("/", response_class=HTMLResponse)
def index(request: Request, session: SessionDep):
    products = get_all_products(session)

    # (Keep your previous fix here)
    return template.TemplateResponse(
        request=request,
        name="Product_list.html",
        context={"products": products}
    )
    

@app.post("/create", response_class=HTMLResponse)
def create(request: Request, session: SessionDep, title: str = Form(...), description: str = Form(...)):
    new_product = ProductCreate(title=title, description=description)
    create_product(session, new_product)
    return RedirectResponse("/", status_code=302)



# Path's Simple API  (Basic Api)
# @app.post("/products", response_model=ProductOut)
# def product_create(session: SessionDep, new_product: ProductCreate):
#    product = create_product(session, new_product)
#    return product

# @app.get("/products", response_model=list[ProductOut])
# def all_products(session: SessionDep):
#   products = get_all_products(session)
#   return products