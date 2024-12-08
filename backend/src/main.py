from fastapi import FastAPI
from routers.user import user_router
from routers.application_form import appl_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

app.include_router(user_router, prefix="/api/authenticate")
app.include_router(appl_router, prefix="/api/application-form")
