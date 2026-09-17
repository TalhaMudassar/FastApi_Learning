# 1. The Modern Way: Grouping Cookies with Pydantic Directly (FastAPI ≥ 0.115.0)
# You can pass the Pydantic model directly into Cookie().
# FastAPI automatically extracts each field from the incoming browser cookies.
from typing import Annotated, Literal
from fastapi import FastAPI, Cookie
from pydantic import BaseModel, Field

app = FastAPI()

class UserCookies(BaseModel):
    model_config = {"extra": "forbid"}  # Reject unexpected cookies

    session_id: str = Field(description="Active session ID")
    theme: Literal["light", "dark"] = "light"
    cart_count: int = Field(default=0, ge=0)

@app.get("/user/dashboard")
async def dashboard(
    cookies: Annotated[UserCookies, Cookie()]
):
    return {
        "session": cookies.session_id,
        "ui_theme": cookies.theme,
        "items_in_cart": cookies.cart_count
    }
    
    
    
    
    
# We tested in the window (command prompt)

# curl -H "Cookie: session_id=sess_998877; theme=dark; cart_count=3" http://127.0.0.1:8000/user/dashboard
