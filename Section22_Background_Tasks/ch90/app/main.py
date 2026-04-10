from fastapi import FastAPI, BackgroundTasks, File, UploadFile
import os
import time

app = FastAPI()


# Background task function
def save_file(filename: str, file_content: bytes):
    
    """
    Saves uploaded file with simulated delay.
    Runs in the background after response is sent.
    """
    print(f"Starting background task: Saving file '{filename}'")
    start_time = time.time()

    # Simulate delay (e.g., processing)
    time.sleep(5)

    file_path = os.path.join("uploads", filename)

    with open(file_path, "wb") as file:
        file.write(file_content)

    end_time = time.time()

    print(
        f"Completed background task: File '{filename}' saved in "
        f"{end_time - start_time:.2f} seconds"
    )


# API endpoint
@app.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Accept file and process it in the background.
    """
    os.makedirs("uploads", exist_ok=True)

    # Read file content
    content = await file.read()

    # Add background task
    background_tasks.add_task(save_file, file.filename, content)

    print(f"Sending response: File '{file.filename}' accepted")

    return {
        "message": f"File '{file.filename}' accepted for background processing"
    }
