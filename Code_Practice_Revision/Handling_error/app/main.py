import logging
from typing import Annotated

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exception_handlers import (
    http_exception_handler,
    request_validation_exception_handler,
)
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException

# Configure basic logging for debugging handlers
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api_error_logger")

app = FastAPI(title="Error Handling Master Suite")


# ==============================================================================
# 0. SCHEMAS & BUSINESS EXCEPTIONS
# ==============================================================================

class ItemPayload(BaseModel):
    title: str = Field(min_length=3, max_length=30)
    quantity: int = Field(gt=0, le=100)


class DomainBusinessRuleException(Exception):
    """Custom domain-level exception for business rule violations."""
    def __init__(self, resource_name: str, reason: str, error_code: str):
        self.resource_name = resource_name
        self.reason = reason
        self.error_code = error_code


# In-memory mock storage
inventory = {
    "laptop": {"stock": 5, "price": 899.99},
    "mouse": {"stock": 0, "price": 25.50},
}


# ==============================================================================
# 1. STANDARD HTTPException WITH DICT DETAIL & CUSTOM HEADERS
# ==============================================================================
# FastAPI's HTTPException accepts any JSON-serializable structure inside 'detail'
# along with custom headers (useful for rate-limiting, error typing, or tracing).

@app.get("/items/{item_id}", status_code=status.HTTP_200_OK)
async def get_inventory_item(item_id: str):
    if item_id not in inventory:
        # Returning a dictionary inside 'detail' instead of just a plain string
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_code": "RESOURCE_NOT_FOUND",
                "message": f"Item '{item_id}' does not exist in active stock.",
                "requested_item": item_id,
            },
            headers={"X-Error-Category": "InventoryLookupFailure"},
        )

    return {"item_id": item_id, "data": inventory[item_id]}


# ==============================================================================
# 2. CUSTOM DOMAIN EXCEPTION HANDLER
# ==============================================================================
# Maps business-layer exceptions to formatted API responses without leaking internals.

@app.exception_handler(DomainBusinessRuleException)
async def domain_exception_handler(request: Request, exc: DomainBusinessRuleException):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error_type": "BUSINESS_LOGIC_VIOLATION",
            "resource": exc.resource_name,
            "reason": exc.reason,
            "code": exc.error_code,
        },
    )


@app.post("/items/{item_id}/purchase", status_code=status.HTTP_200_OK)
async def purchase_item(item_id: str):
    if item_id in inventory and inventory[item_id]["stock"] <= 0:
        raise DomainBusinessRuleException(
            resource_name=item_id,
            reason="Item is completely out of stock.",
            error_code="OUT_OF_STOCK",
        )
    return {"status": "Order Placed", "item": item_id}


# ==============================================================================
# 3. OVERRIDING StarletteHTTPException GLOBALLY
# ==============================================================================
# Registering for StarletteHTTPException catches BOTH manual FastAPI HTTPExceptions
# and framework-level routing errors (e.g., 404 for undefined routes, 405 Method Not Allowed).

@app.exception_handler(StarletteHTTPException)
async def global_http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.error(f"HTTP error occurred: status={exc.status_code} detail={exc.detail}")

    # Standardize all HTTP errors into a uniform corporate schema
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status_code": exc.status_code,
            "error_details": exc.detail,
            "path": request.url.path,
        },
        headers=getattr(exc, "headers", None),
    )


# ==============================================================================
# 4. OVERRIDING RequestValidationError WITH BODY RECOVERY
# ==============================================================================
# When clients submit invalid JSON, RequestValidationError exposes:
# - exc.errors(): Exact list of field-level validation errors
# - exc.body: The raw submitted input (used here for diagnostics/logging)

@app.exception_handler(RequestValidationError)
async def custom_validation_exception_handler(request: Request, exc: RequestValidationError):
    # Sanitize and extract only field names and messages
    clean_errors = [
        {"field": " -> ".join(str(loc) for loc in err["loc"]), "issue": err["msg"]}
        for err in exc.errors()
    ]

    logger.warning(f"Validation failure on {request.url.path}: Body={exc.body}")

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,  # Convert default 422 to 400
        content=jsonable_encoder({
            "success": False,
            "error_type": "VALIDATION_FAILED",
            "total_errors": len(clean_errors),
            "errors": clean_errors,
            "submitted_payload": exc.body,  # echo invalid payload for debugging
        }),
    )


@app.post("/items/create", status_code=status.HTTP_201_CREATED)
async def create_inventory_item(item: ItemPayload):
    return {"status": "Created", "item": item}


# ==============================================================================
# 5. REUSING DEFAULT EXCEPTION HANDLERS (SIDE EFFECTS & HOOKS)
# ==============================================================================
# Shows how to intercept an exception, perform an audit log or metric counter,
# and then delegate back to FastAPI's built-in handler.

@app.get("/intercept-demo/{code}")
async def trigger_intercept_demo(code: int):
    if code == 418:
        raise HTTPException(
            status_code=status.HTTP_418_IM_A_TEAPOT,
            detail="Intercept demonstration triggered.",
        )
    return {"code": code}