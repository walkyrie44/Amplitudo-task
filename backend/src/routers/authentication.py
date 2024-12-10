from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.models import User
from services.security import admin_required, verify_email_token
from database.session import get_db
from fastapi.responses import HTMLResponse
from schemas.authentication import Token, LoginRequest, GoogleLoginRequest
from schemas.users import UserCreate, UserOut
from services.authentication import (
    create_user,
    login_user,
    get_or_create_google_user,
    create_user_token,
    create_user_by_admin,
)
from google.oauth2 import id_token
from google.auth.transport import requests
import os

authentication_router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
LOGIN_URL = os.getenv("LOGIN_URL")


@authentication_router.post("/google-login", response_model=Token)
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


@authentication_router.post("/register", response_model=UserOut)
def register_user(user_create: UserCreate, db: Session = Depends(get_db)):
    db_user = create_user(db, user_create)
    return db_user


@authentication_router.post(
    "/admin/create-user", dependencies=[Depends(admin_required)]
)
def register_user_by_admin(user_create: UserCreate, db: Session = Depends(get_db)):
    db_user = create_user_by_admin(db, user_create)
    return db_user


@authentication_router.post("/login", response_model=Token)
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    token = login_user(db, login_request.email, login_request.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return token


@authentication_router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    email = verify_email_token(token)
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified.")

    user.is_verified = True
    db.commit()

    return HTMLResponse(
        content=f"""
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2 style="color: #4CAF50;">Email Successfully Verified!</h2>
                    <p style="color: #333; font-size: 18px;">Thank you for verifying your email address. You can now log in and access your account.</p>
                    <a href="{LOGIN_URL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Login</a>
                </body>
            </html>
        """
    )
