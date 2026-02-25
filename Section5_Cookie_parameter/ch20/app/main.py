from fastapi import FastAPI, Cookie
from typing import Annotated

app = FastAPI()

# ==========================================================
# 1) BASIC COOKIE PARAMETER
# ==========================================================
# - Cookie values come from the client's browser/request
# - If cookie is not present, value will be None (optional)

@app.get("/product/recommendations")
async def get_recommendations(
    session_id: Annotated[str | None, Cookie()] = None
):
    if session_id:
        return {
            "message": f"Recommendations for session {session_id}",
            "session_id": session_id
        }

    return {
        "message": "No session ID provided, showing default recommendations"
    }


### testing in command prompt  (window)
## With Cookie
# curl -H "Cookie: session_id=abc123" http://127.0.0.1:8000/product/recommendations

## without cookie
# curl http://127.0.0.1:8000/product/recommendations
