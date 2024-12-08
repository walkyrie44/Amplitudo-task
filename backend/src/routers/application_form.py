from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.models import User
from services.security import get_current_user
from schemas.application_form import JobApplicantCreate, JobApplicantRead
from database.session import get_db
from services.application_form import (
    create_or_update_job_applicant,
    get_job_applicants,
    get_job_applicant_by_id,
)

appl_router = APIRouter()


@appl_router.put("/", response_model=JobApplicantRead)
def create_job(
    job_applicant: JobApplicantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_or_update_job_applicant(
        db=db, job_applicant=job_applicant, current_user=current_user
    )


@appl_router.get("/", response_model=list[JobApplicantRead])
def get_applicants(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role_id != 1:
        raise HTTPException(
            status_code=403, detail="You are not authorized to view all job applicants"
        )

    return get_job_applicants(db=db, skip=skip, limit=limit)


@appl_router.get("/single-application", response_model=Optional[JobApplicantRead])
def get_applicant_by_id(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    job_applicant_id = current_user.id
    db_job_applicant = get_job_applicant_by_id(db=db, job_applicant_id=job_applicant_id)
    if db_job_applicant is None:
        return None
    if db_job_applicant.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Job applicant not found or unauthorized"
        )

    return db_job_applicant
