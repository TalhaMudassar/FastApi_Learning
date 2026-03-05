from fastapi import FastAPI
from typing import List

from app.db.config import SessionDep

# Services
from app.users import services as users_services
from app.projects import services as projects_services
from app.tasks import services as tasks_services
from app.comments import services as comments_services

# Schemas
from app.users.schemas import UserCreate, UserUpdate, UserPatch, UserOut
from app.projects.schemas import ProjectCreate, ProjectUpdate, ProjectPatch, ProjectOut
from app.tasks.schemas import TaskCreate, TaskUpdate, TaskPatch, TaskOut
from app.comments.schemas import CommentCreate, CommentUpdate, CommentPatch, CommentOut


app = FastAPI(title="Task Management API")

# ---------------- USERS ----------------

@app.post("/users/", response_model=UserOut)
async def create_user(new_user: UserCreate, session: SessionDep):
    return await users_services.create_user(session, new_user)


@app.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, session: SessionDep):
    return await users_services.get_user(session, user_id)


@app.get("/users/", response_model=List[UserOut])
async def get_all_users(session: SessionDep):
    return await users_services.get_all_users(session)


@app.put("/users/{user_id}", response_model=UserOut)
async def update_user(user_id: int, new_user: UserUpdate, session: SessionDep):
    return await users_services.update_user(session, user_id, new_user)


@app.patch("/users/{user_id}", response_model=UserOut)
async def patch_user(user_id: int, new_user: UserPatch, session: SessionDep):
    return await users_services.patch_user(session, user_id, new_user)


@app.delete("/users/{user_id}")
async def delete_user(user_id: int, session: SessionDep):
    return await users_services.delete_user(session, user_id)


# ---------------- PROJECTS ----------------

@app.post("/projects/", response_model=ProjectOut)
async def create_project(new_project: ProjectCreate, session: SessionDep):
    return await projects_services.create_project(session, new_project)


@app.get("/projects/{project_id}", response_model=ProjectOut)
async def get_project(project_id: int, session: SessionDep):
    return await projects_services.get_project(session, project_id)


@app.get("/projects/", response_model=List[ProjectOut])
async def get_all_projects(session: SessionDep):
    return await projects_services.get_all_projects(session)


@app.put("/projects/{project_id}", response_model=ProjectOut)
async def update_project(project_id: int, new_project: ProjectUpdate, session: SessionDep):
    return await projects_services.update_project(session, project_id, new_project)


@app.patch("/projects/{project_id}", response_model=ProjectOut)
async def patch_project(project_id: int, new_project: ProjectPatch, session: SessionDep):
    return await projects_services.patch_project(session, project_id, new_project)


@app.delete("/projects/{project_id}")
async def delete_project(project_id: int, session: SessionDep):
    return await projects_services.delete_project(session, project_id)


# ---------------- TASKS ----------------

@app.post("/tasks/", response_model=TaskOut)
async def create_task(new_task: TaskCreate, session: SessionDep):
    return await tasks_services.create_task(session, new_task)


@app.get("/tasks/{task_id}", response_model=TaskOut)
async def get_task(task_id: int, session: SessionDep):
    return await tasks_services.get_task(session, task_id)


# Query Parameters Example
@app.get("/tasks/", response_model=List[TaskOut])
async def get_all_tasks(
    session: SessionDep,
    status: str | None = None,
    priority: int | None = None,
):
    return await tasks_services.get_all_tasks(session, status, priority)


@app.put("/tasks/{task_id}", response_model=TaskOut)
async def update_task(task_id: int, new_task: TaskUpdate, session: SessionDep):
    return await tasks_services.update_task(session, task_id, new_task)


@app.patch("/tasks/{task_id}", response_model=TaskOut)
async def patch_task(task_id: int, new_task: TaskPatch, session: SessionDep):
    return await tasks_services.patch_task(session, task_id, new_task)


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int, session: SessionDep):
    return await tasks_services.delete_task(session, task_id)



# ---------------- COMMENTS ----------------

@app.post("/comments/", response_model=CommentOut)
async def create_comment(new_comment: CommentCreate, session: SessionDep):
    return await comments_services.create_comment(session, new_comment)


@app.get("/comments/{comment_id}", response_model=CommentOut)
async def get_comment(comment_id: int, session: SessionDep):
    return await comments_services.get_comment(session, comment_id)


@app.get("/comments/", response_model=List[CommentOut])
async def get_all_comments(session: SessionDep):
    return await comments_services.get_all_comments(session)


@app.put("/comments/{comment_id}", response_model=CommentOut)
async def update_comment(comment_id: int, new_comment: CommentUpdate, session: SessionDep):
    return await comments_services.update_comment(session, comment_id, new_comment)


@app.patch("/comments/{comment_id}", response_model=CommentOut)
async def patch_comment(comment_id: int, new_comment: CommentPatch, session: SessionDep):
    return await comments_services.patch_comment(session, comment_id, new_comment)


@app.delete("/comments/{comment_id}")
async def delete_comment(comment_id: int, session: SessionDep):
    return await comments_services.delete_comment(session, comment_id)
