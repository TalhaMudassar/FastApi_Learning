# 3. SessionMiddleware (Signed Cookie Sessions)
# Enables encrypted, client-side session cookies that persist state across
# multiple requests without manual cookie headers.


from fastapi import FastAPI, Request
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI(title="Session Storage Engine")

# Secret key signs the session cookie to prevent tampering
app.add_middleware(
    SessionMiddleware, 
    secret_key="a-very-secret-encryption-key-for-sessions",
    max_age=3600  # 1 hour
)

@app.post("/cart/add/{item_name}")
async def add_to_cart(item_name: str, request: Request):
    # Retrieve current session cart or initialize empty list
    cart = request.session.get("cart", [])
    cart.append(item_name)
    request.session["cart"] = cart
    return {"status": "item added", "current_cart": cart}

@app.get("/cart")
async def view_cart(request: Request):
    return {"items_in_cart": request.session.get("cart", [])}