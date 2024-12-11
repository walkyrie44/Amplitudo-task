from sqlalchemy.orm import Session
from database.models import User, JobApplicant
from fastapi import status
from passlib.hash import bcrypt
from services.file_upload import save_image


def get_all_unfinished_users(db: Session, page, limit, full_name):
    query = db.query(User).filter(
        User.role_id == 2, User.id.notin_(db.query(JobApplicant.user_id))
    )

    if full_name:
        query = query.filter(User.full_name.ilike(f"%{full_name}%"))

    total_count = query.count()
    total_pages = (total_count + limit - 1) // limit

    unfinished_users = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total_count": total_count,
        "total_pages": total_pages,
        "page": page,
        "page_size": limit,
        "items": unfinished_users,
    }


def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()

    if user.job_applicant:
        db.query(JobApplicant).filter(JobApplicant.user_id == user.id).delete()
        db.commit()

    db.query(User).filter(User.id == user_id).delete()
    db.commit()

    return status.HTTP_204_NO_CONTENT


def update_user_data(db, current_user, payload):
    user = db.query(User).filter(User.id == current_user.id).first()

    if payload.full_name:
        user.full_name = payload.full_name

    if payload.password:
        user.password = bcrypt.hash(payload.password)

    if payload.photo:
        user.photo = save_image(payload.photo)

    db.commit()

    return user
