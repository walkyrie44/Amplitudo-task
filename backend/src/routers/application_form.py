from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database.models import User, JobApplicant
from fastapi.params import Query
from services.security import get_current_user
from schemas.application_form import JobApplicantCreate, JobApplicantRead
from database.session import get_db
from services.application_form import (
    create_or_update_job_applicant,
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


@appl_router.get("/")
def get_applicants(
    page: int = Query(1, gt=0, description="Page number"),
    limit: int = Query(10, gt=0, le=100, description="Number of items per page"),
    full_name: Optional[str] = Query(None, description="Filter by full name"),
    city: Optional[str] = Query(None, description="Filter by city"),
    education: Optional[str] = Query(None, description="Filter by education"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role_id != 1:
        raise HTTPException(
            status_code=403, detail="You are not authorized to view job applicants"
        )

    query = db.query(JobApplicant).options(joinedload(JobApplicant.user))

    if full_name:
        query = query.filter(JobApplicant.full_name.ilike(f"%{full_name}%"))
    if city:
        query = query.filter(JobApplicant.city.ilike(f"%{city}%"))
    if education:
        query = query.filter(JobApplicant.education.ilike(f"%{education}%"))

    total_count = query.count()

    applicants = query.offset((page - 1) * limit).limit(limit).all()

    total_pages = (total_count + limit - 1) // limit

    return {
        "total_count": total_count,
        "total_pages": total_pages,
        "page": page,
        "page_size": limit,
        "items": applicants,
    }


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

    return JobApplicantRead.from_orm(db_job_applicant)
