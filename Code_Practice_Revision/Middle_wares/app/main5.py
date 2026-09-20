# 5. Pure ASGI Class-Based Middleware (Protocol Agnostic)
# Function-based @app.middleware("http") only handles standard HTTP requests. 
# If you are handling WebSockets, raw TCP scopes, or building a reusable library,
# use a class-based ASGI middleware implementing the ASGI specification __call__(scope, receive, send).



from fastapi import FastAPI

app = FastAPI(title="Pure ASGI Middleware Demo")

class PureASGILoggingMiddleware:
    def __init__(self, app, label: str = "ASGI_LOG"):
        self.app = app
        self.label = label

    async def __call__(self, scope, receive, send):
        # scope['type'] can be 'http', 'websocket', or 'lifespan'
        if scope["type"] == "http":
            print(f"[{self.label}] Incoming HTTP path: {scope.get('path')}")
        elif scope["type"] == "websocket":
            print(f"[{self.label}] Incoming WebSocket connection")

        # Pass along the ASGI pipeline
        await self.app(scope, receive, send)

# Register using add_middleware
app.add_middleware(PureASGILoggingMiddleware, label="GATEWAY")

@app.get("/users")
async def list_users():
    return {"users": ["Alice", "Bob"]}




# Test Command:
# curl http://127.0.0.1:8000/users

# Terminal Console Output:
# [GATEWAY] Incoming HTTP path: /users