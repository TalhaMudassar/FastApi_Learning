from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
from typing import Annotated
from pydantic import BaseModel, Field

app = FastAPI()

# ==================================================
# 1. Simple HTML Form (For Browser Testing)
# ==================================================

@app.get("/", response_class=HTMLResponse)
async def get_form():
    return """
    <html>
    <body>
        <h2>Login Form</h2>
        <form action="/login/" method="post">
            <label for="username">Username:</label><br>
            <input type="text" id="username" name="username"><br>

            <label for="password">Password:</label><br>
            <input type="password" id="password" name="password"><br><br>

            <input type="submit" value="Submit">
        </form>
    </body>
    </html>
    """


# ==================================================
# 2. Pydantic Model for Form Data
# ==================================================
# This model:
# - Validates form input
# - Groups fields together
# - Can be reused in other endpoints

class FormData(BaseModel):
    username: str = Field(max_length=10)
    password: str = Field(min_length=3, max_length=8)

    # Forbid extra fields for better security
    # If client sends extra fields -> 422 error
    model_config = {"extra": "forbid"}


# ==================================================
# 3. Endpoint That Accepts Form Data as Pydantic Model
# ==================================================
# Annotated[FormData, Form()] tells FastAPI:
# "Read this model from form data, not JSON body"

@app.post("/login/")
async def login(
    data: Annotated[FormData, Form()],
):
    # data is already validated Pydantic model
    return data
