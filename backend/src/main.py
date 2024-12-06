from fastapi import FastAPI
from routers.user import user_router
from routers.application_form import appl_router

app = FastAPI()

app.include_router(user_router, prefix="/api/users")
app.include_router(appl_router, prefix="/api/application-form")
