from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from typing import Annotated
import os
import uuid
import shutil

app = FastAPI()

# ==================================================
# 1. Simple HTML Form for Testing Multiple File Upload
# ==================================================
# - "multiple" attribute allows selecting multiple files
# - name="files" MUST match the parameter name in endpoint
# - enctype="multipart/form-data" is REQUIRED for file uploads

@app.get("/", response_class=HTMLResponse)
async def main():
    return """
        <html>
          <body>
            <h2>Multiple File Upload (UploadFile)</h2>
            <form action="/uploadfiles/" enctype="multipart/form-data" method="post">
              <input name="files" type="file" multiple>
              <input type="submit" value="Upload">
            </form>
          </body>
        </html>
    """


# ==================================================
# 2. Endpoint: Upload Multiple Files
# ==================================================
# - files: list[UploadFile] means FastAPI expects multiple files
# - Uses streaming copy (memory efficient)
# - Each file is saved to "uploads/" folder
# - We generate unique filenames to avoid overwriting files

@app.post("/uploadfiles/")
async def create_upload_files(
    files: Annotated[list[UploadFile], File()]
):
    saved_files = []

    # Create uploads directory if it does not exist
    os.makedirs("uploads", exist_ok=True)

    for file in files:
        # Make filename unique to avoid conflicts
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        save_path = f"uploads/{unique_filename}"

        # Save file using streaming copy
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        saved_files.append({
            "original_filename": file.filename,
            "saved_as": unique_filename,
            "content_type": file.content_type,
        })

    return {
        "message": "Files uploaded successfully",
        "files": saved_files
    }
