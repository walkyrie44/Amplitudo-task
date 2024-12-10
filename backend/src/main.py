from fastapi import FastAPI
from routers.authentication import authentication_router
from routers.users import users_router
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

app.include_router(authentication_router, prefix="/api/authenticate")
app.include_router(appl_router, prefix="/api/application-form")
app.include_router(users_router, prefix="/api/users")
