from fastapi import FastAPI
from app.categories.routers import router as user_router
from app.courses.routers import router as course_router
from app.enrollments.routers import router as enrollments_router
from app.lessons.routers import router as lessons_router
from app.users.routers import router as users_router

app = FastAPI()

app.include_router(user_router)
app.include_router(course_router)
app.include_router(enrollments_router)
app.include_router(lessons_router)
app.include_router(users_router)
