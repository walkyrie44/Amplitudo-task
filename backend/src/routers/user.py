from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.security import admin_required
from database.session import get_db
from schemas.user import UserCreate, UserOut, Token
from services.user import create_user, login_user, create_user_token, get_all_users

user_router = APIRouter()


@user_router.post("/register", response_model=UserOut)
def register_user(user_create: UserCreate, db: Session = Depends(get_db)):
    db_user = create_user(db, user_create)
    return db_user


@user_router.post("/login", response_model=Token)
def login(email: str, password: str, db: Session = Depends(get_db)):
    db_user = login_user(db, email, password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return create_user_token(db_user)


@user_router.get("/", dependencies=[Depends(admin_required)])
def get_all(db: Session = Depends(get_db)):
    users = get_all_users(db)
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return users
