from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse
from typing import Annotated
import os
import shutil
import uuid

app = FastAPI()

# ==================================================
# 1. HTML Form: Send Text + File Together
# ==================================================
# IMPORTANT:
# - enctype="multipart/form-data" is REQUIRED for file upload
# - input name="username" must match endpoint parameter
# - input name="file" must match endpoint parameter

@app.get("/", response_class=HTMLResponse)
async def get_form():
    return """
    <html>
        <head>
            <title>User Profile Upload</title>
        </head>
        <body>
            <h2>User Profile Form</h2>

            <form action="/user-with-file/" enctype="multipart/form-data" method="post">
                <label for="username">Username:</label><br>
                <input type="text" id="username" name="username" required><br><br>

                <label for="file">Profile Picture (optional):</label><br>
                <input type="file" id="file" name="file" accept="image/*"><br><br>

                <input type="submit" value="Submit">
            </form>
        </body>
    </html>
    """


# ==================================================
# 2. Endpoint: Receive Form Field + File
# ==================================================
# - username comes from Form()
# - file comes from File()
# - file is optional (can be None)
# - If file exists, we save it to "uploads/" folder

@app.post("/user-with-file/")
async def create_user_with_file(
    username: Annotated[str, Form()],
    file: Annotated[UploadFile | None, File()] = None
):
    response = {"username": username}

    if file:
        os.makedirs("uploads", exist_ok=True)

        # Make filename unique to avoid overwrite
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        save_path = f"uploads/{unique_filename}"

        # Save file using streaming copy (memory efficient)
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        response["filename"] = file.filename
        response["saved_as"] = unique_filename
        response["content_type"] = file.content_type

    return response
