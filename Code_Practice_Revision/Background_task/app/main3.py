# Module 3: Safe File Processing in Background (Memory Safe)
# When handling file uploads with BackgroundTasks, avoid storing raw content = await file.read() in RAM before invoking the task. Instead,
# stream the file to a temporary location on disk during the request, and pass the file path to the worker.

import os
import shutil
import uuid
import time
from fastapi import FastAPI, BackgroundTasks, File, UploadFile, status

app = FastAPI(title="Background File Pipeline")

TEMP_DIR = "temp_processing"
PROCESSED_DIR = "processed_files"
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

def process_heavy_file(temp_path: str, target_filename: str):
    """Simulates CPU-heavy image/file operations (resizing, virus scan, parsing)."""
    try:
        print(f"[Worker] Beginning processing on {temp_path}...")
        time.sleep(3)  # Simulating transformation
        
        final_destination = os.path.join(PROCESSED_DIR, target_filename)
        shutil.move(temp_path, final_destination)
        print(f"[Worker] File moved successfully to {final_destination}")
    except Exception as exc:
        print(f"[Worker Error] Processing failed: {exc}")
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/upload-document/", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    file: UploadFile,
    background_tasks: BackgroundTasks
):
    # 1. Generate unique temporary tracking path
    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    temporary_stage_path = os.path.join(TEMP_DIR, unique_name)
    
    # 2. Stream chunk-by-chunk to disk without overloading RAM
    with open(temporary_stage_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 3. Offload processing to background task by passing the PATH (not file contents)
    background_tasks.add_task(
        process_heavy_file,
        temp_path=temporary_stage_path,
        target_filename=unique_name
    )

    return {
        "status": "Accepted",
        "file_id": unique_name,
        "message": "File uploaded and staged. Processing started in background."
    }
    
    
    
# Test Command:
# echo "Sample analytical report contents" > report.csv
# curl -X POST "http://127.0.0.1:8000/upload-document/" -F "file=@report.csv"

# Immediate Response (202 Accepted):
# {
#   "status": "Accepted",
#   "file_id": "7b8e1f0a2c3d_report.csv",
#   "message": "File uploaded and staged. Processing started in background."
# }

# Terminal Console Order:
# [HTTP] 202 Accepted returned to client
# [Worker] Beginning processing on temp_processing/7b8e1f0a2c3d_report.csv...
# [Worker] File moved successfully to processed_files/7b8e1f0a2c3d_report.csv