# Module 1: Basic Background Task (Email / Audit Log)
# The standard pattern: declare background_tasks: BackgroundTasks 
# as a parameter and register tasks with .add_task(func, *args, **kwargs).


from fastapi import FastAPI, BackgroundTasks, status
import time

app = FastAPI(title="Basic Background Tasks")

def send_welcome_email(recipient: str, client_name: str):
    """Simulates sending an email via external SMTP."""
    time.sleep(2)  # Simulating network latency with SMTP server
    with open("notifications.log", "a", encoding="utf-8") as log_file:
        log_file.write(f"EMAIL DISPATCHED: to={recipient}, name={client_name}\n")
    print(f"[Worker] Email successfully delivered to {recipient}")

@app.post("/register", status_code=status.HTTP_202_ACCEPTED)
async def register_user(
    email: str,
    full_name: str,
    background_tasks: BackgroundTasks
):
    # Register the background worker function with its arguments
    background_tasks.add_task(send_welcome_email, recipient=email, client_name=full_name)
    
    # Client receives this immediately; does NOT wait 2 seconds
    return {
        "status": "Accepted",
        "message": f"Account for {full_name} created. Confirmation email is sending in the background."
    }
    
    
    
    
    
    
    
    
    
    
# Test Command:
# curl -X POST "http://127.0.0.1:8000/register?email=alex@example.com&full_name=AlexDev"


# Immediate Response (202 Accepted):
# {
#   "status": "Accepted",
#   "message": "Account for AlexDev created. Confirmation email is sending in the background."
# }

# Log Output (notifications.log):
# EMAIL DISPATCHED: to=alex@example.com, name=AlexDev
    