from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
from typing import Annotated

app = FastAPI()

# ==================================================
# 1. Simple HTML Form (For Testing in Browser)
# ==================================================
# This endpoint returns a basic HTML login form.
# response_class=HTMLResponse tells FastAPI:
# "Return this as HTML, not JSON"

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
# 2. Handle Form Submission (Basic Version)
# ==================================================
# The browser sends data as:
# Content-Type: application/x-www-form-urlencoded
#
# Form() tells FastAPI:
# "Get this value from form data, not JSON body"

@app.post("/login/")
async def login(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()]
):
    return {
        "username": username,
        "password_length": len(password)  # Just for demo, don't return real passwords 🙂
    }


# ==================================================
# 3. Handle Form Submission with Validation
# ==================================================
# We add validation rules:
# - username: min 3, max 10 characters
# - password: min 3, max 8 characters
#
# If validation fails, FastAPI automatically returns 422 error

@app.post("/login/validated/")
async def login_validated(
    username: Annotated[str, Form(min_length=3, max_length=10)],
    password: Annotated[str, Form(min_length=3, max_length=8)]
):
    return {
        "username": username,
        "password_length": len(password)
    }
