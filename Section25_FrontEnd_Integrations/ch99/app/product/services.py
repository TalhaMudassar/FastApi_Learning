from sqlmodel import select, Session 
from app.product.models import Product, ProductOut, ProductCreate


def create_product(session: Session, new_product: ProductCreate) -> ProductOut:
    product = Product(title=new_product.title, description=new_product.description)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

def get_all_product(session:Session) ->list[ProductOut]:
    stmt = select(Product)
    product = session.exec(stmt) 
    return product.all() 

