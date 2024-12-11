from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.params import Query
from sqlalchemy.orm import Session
from typing import Optional
from schemas.users import UpdateUser, UserOut
from services.security import get_current_user
from database.models import User
from services.security import admin_required
from database.session import get_db
from services.users import get_all_unfinished_users, delete_user, update_user_data

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


@users_router.get("/user")
def get_user(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    return UserOut(full_name=user.full_name, photo=user.photo)


@users_router.put("/update-user")
def update_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    payload: UpdateUser = Body(...),
):
    user = update_user_data(db=db, current_user=current_user, payload=payload)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(full_name=user.full_name, photo=user.photo)
