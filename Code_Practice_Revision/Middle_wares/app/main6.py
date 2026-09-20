# 1. GZipMiddleware (Bandwidth & Performance)
# Automatically compresses large responses using gzip compression
# if the client sends an Accept-Encoding: gzip header.

from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI(title="GZip Compression Suite")

# minimum_size: Only responses larger than 1000 bytes will be compressed
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.get("/large-data")
async def get_large_payload():
    # Returns a large payload exceeding the 1000 byte threshold
    return {"numbers": list(range(1000))}    



# Test Command:
# curl -i -H "Accept-Encoding: gzip" http://127.0.0.1:8000/large-data

# Expected Response Header:
# HTTP
# content-encoding: gzip   