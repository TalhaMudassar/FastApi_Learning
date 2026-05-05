from fastapi import FastAPI
from dotenv import load_dotenv
import os 

# Load enviroment variable from .env file 
load_dotenv()

app = FastAPI()

@app.get("/")
def readenv():
    return {
        "api_secret" : os.getenv("API_SECRET_KEY"),
        "debug_mode" : os.getenv("DEBUG")
    }