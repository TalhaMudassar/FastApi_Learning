from fastapi import FastAPI

app = FastAPI()

# =====================================
# PATH CONVERTER (:path)
# =====================================
# By default, FastAPI captures only ONE path segment
# Example: /files/test.txt

# If you want to capture MULTIPLE path segments
# Example: /files/product/items/value/1
# use the :path converter

@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    """
    file_path will capture the entire path after /files/
    """
    return {
        "requested_file_path": file_path
    }
