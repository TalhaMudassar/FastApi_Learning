# # 1. Modern Annotated Pattern with Metadata (title & description)
# # FastAPI officially recommends using typing.Annotated. 
# # It keeps the actual default value intuitive in Python and adds OpenAPI documentation metadata.
# # from typing import Annotated
# # from fastapi import FastAPI, Query

# app = FastAPI()

# @app.get("/items/")
# async def read_items(
#     q: Annotated[
#         str | None,
#         Query(
#             title="Query string",
#             description="Query string for items to search in the database",
#             min_length=3,
#             max_length=50,
#         ),
#     ] = None,
# ):
#     results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
#     if q:
#         results.update({"q": q})
#     return results



# # -----------------------------------------------------------------------------
# # 2. Required Parameter That Can Be None
# # Forces the client to explicitly pass the key in the URL, but allows its value to be empty/null.
# from typing import Annotated
# from fastapi import FastAPI, Query

# app = FastAPI()
# # Notice: no '= None' at the end, so it is strictly REQUIRED
# @app.get("/items")
# async def read_items(q: Annotated[str | None, Query(min_length=3)]):
#     return {"q":q}



# # -----------------------------------------------------------------------------
# # 3. Query Parameter Lists with Default Fallback Values
# # Accepts multiple values in the query string (?q=foo&q=bar),
# # but falls back to a multi-element default list if none are passed.
# from typing import Annotated
# from fastapi import FastAPI, Query

# app = FastAPI()

# @app.get("/items")
# async def read_items(q: Annotated[list[str], Query()] = ["default_a", "default_b"]):
#     return {"q": q}



#--------------------------------------------------------------------------------
# 4. Hide Parameters from Docs (include_in_schema=False)
# Lets you accept an internal query parameter (like a debug flag, feature toggle,
# or tracing token) without exposing it in the public Swagger UI schema.
from typing import Annotated
from fastapi import FastAPI, Query
app = FastAPI()

@app.get("/items/")
async def read_items(
    hidden_token : Annotated[str | None, Query(include_in_schema=False)] = None
):
    if hidden_token:
        return {"mode": "secret_access", "token": hidden_token}
    return {"mode": "public"}


        


