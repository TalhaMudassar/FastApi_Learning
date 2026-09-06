from fastapi import FastAPI
from app.resume.routers import router as resume_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/uploads",StaticFiles(directory="uploads"),name="uplaods")


app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"], # Vite Dev server 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)