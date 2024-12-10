from sqlalchemy.orm import Session
from services.email_settings import send_verification_email
from database.models import User
from schemas.users import UserCreate
from schemas.authentication import Token
from services.security import create_access_token, create_email_verification_token
from passlib.hash import bcrypt
from services.file_upload import save_image
from fastapi import HTTPException


def create_user(db: Session, user_create: UserCreate):
    hashed_password = bcrypt.hash(user_create.password)
    user_data = {
        "email": user_create.email,
        "password": hashed_password,
        "role_id": user_create.role_id,
    }

    if user_create.full_name:
        user_data["full_name"] = user_create.full_name

    if user_create.photo:
        user_data["photo"] = save_image(user_create.photo)

    db_user = User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = create_email_verification_token(user_create.email)
    send_verification_email(user_create.email, token)
    return db_user


def create_user_by_admin(db: Session, user_create: UserCreate):
    hashed_password = bcrypt.hash(user_create.password)
    user_data = {
        "email": user_create.email,
        "password": hashed_password,
        "role_id": user_create.role_id,
        "is_verified": True,
    }

    if user_create.full_name:
        user_data["full_name"] = user_create.full_name

    if user_create.photo:
        user_data["photo"] = save_image(user_create.photo)

    db_user = User(**user_data)
    db.add(db_user)
    db.commit()

    return db_user


def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if user and bcrypt.verify(password, user.password):
        if not user.is_verified:
            raise HTTPException(
                status_code=400,
                detail="Email not verified. Please verify your email first.",
            )
        return create_user_token(user)
    return None


def create_user_token(user: User):
    access_token = create_access_token(data={"sub": user.email, "role": user.role_id})
    return Token(access_token=access_token, token_type="bearer")


def get_or_create_google_user(db: Session, email: str, full_name: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user_data = {
            "email": email,
            "password": None,
            "role_id": 2,
            "full_name": full_name,
        }
        user = User(**user_data)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
