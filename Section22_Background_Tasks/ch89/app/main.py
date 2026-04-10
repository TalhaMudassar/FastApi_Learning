from fastapi import FastAPI, BackgroundTasks

app = FastAPI()


# Background task function
def write_notification(email: str, message: str = ""):
    """
    Writes a notification message to a log file.
    Runs in the background after response is sent.
    """
    with open("log.txt", mode="a") as file:
        content = f"Notification for {email}: {message}\n"
        file.write(content)


# API endpoint
@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    # Adds a background task to write notification.
    background_tasks.add_task(write_notification,email,message="Some notification from domain")
    return {"message": "Notification sent successfully!"}
