# Import the FastAPI class from the fastapi package
# This class is used to create a new FastAPI application instance
from fastapi import FastAPI

# Create an instance of the FastAPI class
# This 'app' object will be the main application that handles requests and responses
app = FastAPI()

# Define a route using the @app.get() decorator
# This tells FastAPI that when someone sends a GET request to the root URL ("/"),
# the following function (home) should be executed
@app.get("/")
def home():
    # This function returns a JSON response
    # The dictionary {"message": "Hello fast api"} will be automatically converted to JSON
    return {"message": "Hello fast api"}
