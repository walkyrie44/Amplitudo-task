from fastapi import APIRouter, Depends, HTTPException
from fastapi.params import Query
from sqlalchemy.orm import Session
from typing import Optional
from services.security import get_current_user
from database.models import User
from services.security import admin_required
from database.session import get_db
from services.users import (
    get_all_unfinished_users,
    delete_user,
)

users_router = APIRouter()


@users_router.get("/", dependencies=[Depends(admin_required)])
def get_unfinished_users(
    page: int = Query(1, gt=0, description="Page number"),
    limit: int = Query(10, gt=0, le=100, description="Number of items per page"),
    full_name: Optional[str] = Query(None, description="Filter by full name"),
    db: Session = Depends(get_db),
):
    users = get_all_unfinished_users(db, page, limit, full_name)
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return users


@users_router.delete("/{user_id}/delete", dependencies=[Depends(admin_required)])
def delete_user_handler(user_id: int, db: Session = Depends(get_db)):
    user = delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@users_router.get("/name")
def get_name_from_user(current_user: User = Depends(get_current_user)):
    return current_user.full_name
