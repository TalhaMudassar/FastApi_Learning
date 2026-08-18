# Use the official Python image as the base image.
# Python version: 3.13.5
FROM python:3.13.5


# ---------------------------------------------------------
# ENVIRONMENT VARIABLES
# ---------------------------------------------------------

# Prevent Python from creating .pyc (bytecode) files.
# This keeps the Docker container cleaner.
ENV PYTHONDONTWRITEBYTECODE=1

# Make Python output appear immediately in Docker logs.
# Without this, Python may buffer output.
ENV PYTHONUNBUFFERED=1


# ---------------------------------------------------------
# WORKING DIRECTORY
# ---------------------------------------------------------

# Set the working directory inside the Docker container.
# All following commands will run from /ch117.
WORKDIR /ch117


# ---------------------------------------------------------
# COPY REQUIREMENTS
# ---------------------------------------------------------

# Copy requirements.txt from the local project
# into the /ch117 directory inside the container.
COPY requirements.txt .


# Install all Python dependencies listed in requirements.txt.
#
# --no-cache-dir:
# Prevents pip from storing downloaded package caches,
# which helps keep the Docker image smaller.
RUN pip install --no-cache-dir -r requirements.txt


# ---------------------------------------------------------
# COPY PROJECT FILES
# ---------------------------------------------------------

# Copy the entire project from the current local directory
# into the /ch117 directory inside the Docker container.
COPY . /ch117/


# ---------------------------------------------------------
# CONTAINER START COMMAND
# ---------------------------------------------------------

# Start the container with an infinite sleep command.
#
# This is useful during development because the container
# stays running without automatically starting FastAPI.
#
# You can then enter the running container and manually
# execute commands such as:
#
#     fastapi dev app/main.py
#
# or:
#
#     uvicorn app.server:app --reload
#
CMD ["sleep", "infinity"]


# ---------------------------------------------------------
# FASTAPI DEVELOPMENT SERVER
# ---------------------------------------------------------

# Instead of the sleep command above, you can start
# FastAPI automatically when the container starts.
#
# Uncomment this CMD and comment out the "sleep" CMD above
# if you want FastAPI to start automatically.
#
# --host 0.0.0.0:
# Makes FastAPI accessible outside the container.
#
# --port 8000:
# Runs FastAPI on port 8000.
#
# CMD ["fastapi", "dev", "--host", "0.0.0.0", "--port", "8000"]


# ---------------------------------------------------------
# UVICORN OPTION
# ---------------------------------------------------------

# If your FastAPI application file is not named main.py,
# you can specify the exact Python module and FastAPI app.
#
# For example, if your project structure is:
#
#     /ch117
#     ├── app/
#     │   ├── __init__.py
#     │   └── server.py
#     └── requirements.txt
#
# And inside server.py you have:
#
#     app = FastAPI()
#
# Then:
#
#     app.server:app
#
# means:
#
#     app      -> Python package/folder
#     server   -> server.py
#     app      -> FastAPI application object
#
# The command below starts that application using Uvicorn.
#
# --reload:
# Automatically reloads the server when code changes.
# This is mainly useful during development.
#
# CMD ["uvicorn", "app.server:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

