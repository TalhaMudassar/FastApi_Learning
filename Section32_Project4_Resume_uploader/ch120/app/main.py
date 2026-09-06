from fastapi import FastAPI,Request
from app.resume.routers import router as resume_router
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from app.db.config import SessionDep
from app.resume.services import get_all_resumes
app = FastAPI()

# mount static files 
app.mount("/static", StaticFiles(directory="app/static"),name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# templates
templates = Jinja2Templates(directory="app/templates")


PAKISTAN_REGIONS = [
    "Punjab","Sindh","Khyber Pakhtunkhwa","Balochistan",
    "Islamabad Capital Territory","Azad Jammu and Kashmir","Gilgit-Baltistan"
]

PREFERRED_LOCATIONS = [
    "Islamabad","Rawalpindi","Lahore","Karachi",
    "Faisalabad","Peshawar","Multan","Gujranwala",
    "Sialkot","Quetta","Hyderabad","Abbottabad"
]

app.include_router(resume_router)


# work for getting resume list 
@app.get("/",response_class=HTMLResponse)
async def resume_list(request: Request, session: SessionDep):
    resumes = await get_all_resumes(session) # this resume we use for jinjatemplate
    return templates.TemplateResponse(
    request=request,
    name="resume_list.html",
    context={"resumes": resumes} # Add your other variables here
)


@app.get("/create",response_class=HTMLResponse)
async def form(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="upload_resume.html",
        context={
            "paksitan_regions": PAKISTAN_REGIONS,
            "preferred_location_option": PREFERRED_LOCATIONS
        }
    )

@app.get("/success",response_class=HTMLResponse)
async def successdef(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="success.html" # <-- Just add this line!
    )