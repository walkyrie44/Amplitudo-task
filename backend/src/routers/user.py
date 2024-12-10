from fastapi import APIRouter, Depends, HTTPException
from fastapi.params import Query
from sqlalchemy.orm import Session
from typing import Optional
from services.security import admin_required
from database.session import get_db
from schemas.user import UserCreate, UserOut, Token, LoginRequest, GoogleLoginRequest
from services.user import (
    create_user,
    login_user,
    get_all_unfinished_users,
    get_or_create_google_user,
    create_user_token,
    delete_user
)
from google.oauth2 import id_token
from google.auth.transport import requests
import os

user_router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


@user_router.post("/google-login", response_model=Token)
def google_login(
    google_login_request: GoogleLoginRequest, db: Session = Depends(get_db)
):
    try:
        idinfo = id_token.verify_oauth2_token(
            google_login_request.token, requests.Request(), GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        full_name = idinfo.get("name")

        if not email:
            raise HTTPException(
                status_code=400, detail="Google login failed: email not provided"
            )

        user = get_or_create_google_user(db, email=email, full_name=full_name)

        token = create_user_token(user)
        return token

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")


@user_router.post("/register", response_model=UserOut)
def register_user(user_create: UserCreate, db: Session = Depends(get_db)):
    db_user = create_user(db, user_create)
    return db_user


@user_router.post("/login", response_model=Token)
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    token = login_user(db, login_request.email, login_request.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return token


@user_router.get("/", dependencies=[Depends(admin_required)])
def get_unfinished_users(page: int = Query(1, gt=0, description="Page number"),
    limit: int = Query(10, gt=0, le=100, description="Number of items per page"), full_name: Optional[str] = Query(None, description="Filter by full name"), db: Session = Depends(get_db)):
    users = get_all_unfinished_users(db, page, limit, full_name)
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return users


@user_router.delete("/{user_id}/delete", dependencies=[Depends(admin_required)])
def delete_user_handler(user_id: int, db: Session = Depends(get_db)):
    user = delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
    