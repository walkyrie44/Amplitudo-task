from sqlalchemy.orm import Session
from database.models import User
from services.file_upload import save_documents
from services.file_upload import save_image
from database.models import JobApplicant
from schemas.application_form import JobApplicantCreate, JobApplicantRead


def create_job_applicant(
    db: Session, job_applicant: JobApplicantCreate, current_user: User
):
    db_job_applicant = JobApplicant(
        full_name=job_applicant.full_name,
        birth_date=job_applicant.birth_date,
        city=job_applicant.city,
        country=job_applicant.country,
        gender=job_applicant.gender,
        education=job_applicant.education,
        cv_files=save_documents(job_applicant.cv_files),
        profile_picture=save_image(job_applicant.profile_picture),
        user_id=current_user.id,
    )
    db.add(db_job_applicant)
    db.commit()
    db.refresh(db_job_applicant)
    return JobApplicantRead.from_orm(db_job_applicant)


def get_job_applicants(db: Session, skip: int = 0, limit: int = 10):
    return db.query(JobApplicant).offset(skip).limit(limit).all()


def get_job_applicant_by_id(db: Session, job_applicant_id: int):
    return db.query(JobApplicant).filter(JobApplicant.id == job_applicant_id).first()
