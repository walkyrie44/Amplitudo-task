from sqlalchemy.orm import Session
from database.models import User, JobApplicant
from schemas.user import UserCreate, Token, UserOut
from services.security import create_access_token
from passlib.hash import bcrypt
from services.file_upload import save_image
from fastapi import status


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
    return db_user

def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if user and bcrypt.verify(password, user.password):
        return create_user_token(user)
    return None

def create_user_token(user: User):
    access_token = create_access_token(data={"sub": user.email, "role": user.role_id})
    return Token(access_token=access_token, token_type="bearer")

def get_all_unfinished_users(db: Session, page, limit):
    total_count = db.query(User).filter(
        User.role_id == 2,
        User.id.notin_(db.query(JobApplicant.user_id))
    ).count()

    total_pages = (total_count + limit - 1) // limit

    unfinished_users = (
        db.query(User)
        .filter(
            User.role_id == 2,
            User.id.notin_(db.query(JobApplicant.user_id))
        )
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total_count": total_count,
        "total_pages": total_pages,
        "page": page,
        "page_size": limit,
        "items": unfinished_users,
    }

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

def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()

    if user.job_applicant:
        db.query(JobApplicant).filter(JobApplicant.user_id == user.id).delete()
        db.commit()

    db.query(User).filter(User.id == user_id).delete()
    db.commit()

    return status.HTTP_204_NO_CONTENT
