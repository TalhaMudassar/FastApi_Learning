from fastapi import FastAPI, WebSocket, Cookie, Query, Depends, WebSocketException, status, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from typing import Annotated

app = FastAPI()

# Simple HTML client
html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form onsubmit="sendMessage(event)">
            <label>Item ID: <input type="text" id="itemId" value="foo" /></label>
            <label>Token: <input type="text" id="token" value="some-key-token" /></label>
            <button onclick="connect(event)">Connect</button>
            <hr>
            <label>Message: <input type="text" id="messageText" /></label>
            <button>Send</button>
        </form>
        <ul id="messages"></ul>

        <script>
            var ws = null;

            function connect(event) {
                var itemId = document.getElementById("itemId").value;
                var token = document.getElementById("token").value;

                ws = new WebSocket("ws://localhost:8000/items/" + itemId + "/ws?token=" + token);

                ws.onmessage = function(event) {
                    var messages = document.getElementById("messages");
                    var message = document.createElement("li");
                    message.textContent = event.data;
                    messages.appendChild(message);
                };

                event.preventDefault();
            }

            function sendMessage(event) {
                var input = document.getElementById("messageText");
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


# 🔐 Dependency (Authentication check)
async def get_cookie_or_token(
    websocket: WebSocket,
    session: Annotated[str | None, Cookie()] = None,
    token: Annotated[str | None, Query()] = None,
):
    if session is None and token is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    return session or token


# 🔌 WebSocket endpoint
@app.websocket("/items/{item_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    item_id: str,
    cookie_or_token: Annotated[str, Depends(get_cookie_or_token)],
):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()

            # send token info
            await websocket.send_text(
                f"Token/Session: {cookie_or_token}"
            )

            # send message back
            await websocket.send_text(
                f"Message: {data} (Item ID: {item_id})"
            )

    except WebSocketDisconnect:
        print("Client disconnected")