from fastapi import FastAPI, Request, Form
from contextlib import asynccontextmanager
from app.db.config import create_tables, SessionDep
from app.product.services import *
from app.product.models import * # HTML response
from fastapi.responses import HTMLResponse

# Static files
from fastapi.staticfiles import StaticFiles

# Jinja2
from fastapi.templating import Jinja2Templates

# Import Path
from pathlib import Path

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(lifespan=lifespan)

# Define the base directory
BASE_DIR = Path(__file__).resolve().parent

# Mount templates
template = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Mount static files
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return template.TemplateResponse(
        request=request, 
        name="index.html"
    )
    
@app.get("/form", response_class=HTMLResponse)
def load_form(request: Request):
    return template.TemplateResponse(
        request=request, 
        name="product_form.html"
    )
    
@app.get("/products/list", response_class=HTMLResponse)
def product_list(request: Request, session: SessionDep):
    products = get_all_product(session)
    return template.TemplateResponse(
        request=request, 
        name="product_list.html", 
        context={"products": products} 
    )
    
@app.post("/products", response_class=HTMLResponse)
def add_product(
    request: Request, 
    session: SessionDep,
    title: str = Form(...), 
    description: str = Form(...)
):
    # 1. Package the form data into your ProductCreate model
    new_product = ProductCreate(title=title, description=description)
    
    # 2. Use your services.py function to save it to the database
    create_product(session, new_product)
    
    # 3. Fetch the updated list of all products from the database
    products = get_all_product(session)
    
    # 4. Return the HTML list so HTMX can update the page dynamically
    return template.TemplateResponse(
        request=request, 
        name="product_list.html", 
        context={"products": products} 
    )