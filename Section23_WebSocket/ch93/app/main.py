from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

app = FastAPI()


# HTML client
html = """
<!DOCTYPE html>
<html>
    <head>
        <title>WebSocket Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat (Single Client)</h1>

        <form onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>

        <ul id="messages"></ul>

        <script>
            const ws = new WebSocket("ws://localhost:8000/ws");

            ws.onmessage = function(event) {
                const messages = document.getElementById("messages");
                const message = document.createElement("li");
                message.textContent = event.data;
                messages.appendChild(message);
            };

            function sendMessage(event) {
                const input = document.getElementById("messageText");
                ws.send(input.value);
                input.value = "";
                event.preventDefault();
            }
        </script>
    </body>
</html>
"""


@app.get("/")
async def home():
    return HTMLResponse(html)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Handles WebSocket connection for a single client
    with proper disconnect handling.
    """
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message received: {data}")

    except WebSocketDisconnect:
        print("Client disconnected")
