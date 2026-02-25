from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from typing import Annotated
import os
import uuid
import shutil

app = FastAPI()

# ==================================================
# 1. Simple HTML Page for Testing File Upload
# ==================================================
# Note:
# - enctype="multipart/form-data" is REQUIRED for file uploads
# - We show two forms:
#   1) Upload as bytes
#   2) Upload using UploadFile (recommended for large files)

@app.get("/", response_class=HTMLResponse)
async def main():
    return """
    <html>
      <body>
        <h2>Single File Upload (bytes)</h2>
        <form action="/files/" enctype="multipart/form-data" method="post">
          <input name="file" type="file">
          <input type="submit" value="Upload">
        </form>

        <h2>Single File Upload (UploadFile)</h2>
        <form action="/uploadfile/" enctype="multipart/form-data" method="post">
          <input name="file" type="file">
          <input type="submit" value="Upload">
        </form>
      </body>
    </html>
    """


# ==================================================
# 2. Upload File as BYTES (Not Recommended for Large Files)
# ==================================================
# - The whole file is read into memory at once
# - OK for small files
# - Dangerous for big files (memory issue)

@app.post("/files/")
async def create_file_bytes(file: Annotated[bytes | None, File()] = None):
    if not file:
        return {"message": "No file sent"}

    # Create uploads directory if not exists
    os.makedirs("uploads", exist_ok=True)

    # Generate random filename
    filename = f"{uuid.uuid4()}.bin"
    save_path = f"uploads/{filename}"

    # Save file to disk
    with open(save_path, "wb") as buffer:
        buffer.write(file)

    return {
        "message": "File uploaded as bytes",
        "filename": filename,
        "file_size": len(file),
    }


# ==================================================
# 3. Upload File using UploadFile (RECOMMENDED WAY ✅)
# ==================================================
# - Uses SpooledTemporaryFile (streaming)
# - Does NOT load whole file into memory
# - Best for large files
# - Gives access to:
#   file.filename
#   file.content_type
#   file.file (file-like object)

@app.post("/uploadfile/")
async def create_upload_file(
    file: Annotated[UploadFile | None, File()] = None
):
    if not file:
        return {"message": "No upload file sent"}

    # Create uploads directory if not exists
    os.makedirs("uploads", exist_ok=True)

    # (Optional) Make filename safer / unique
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    save_path = f"uploads/{unique_filename}"

    # Save file to disk using streaming copy
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "File uploaded successfully",
        "original_filename": file.filename,
        "saved_as": unique_filename,
        "content_type": file.content_type,
    }
