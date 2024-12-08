from sqlalchemy.orm import Session
from database.models import User
from services.file_upload import save_documents
from services.file_upload import save_image
from database.models import JobApplicant
from schemas.application_form import JobApplicantCreate, JobApplicantRead


def create_or_update_job_applicant(
    db: Session, job_applicant: JobApplicantCreate, current_user: User
):
    db_job_applicant = (
        db.query(JobApplicant).filter(JobApplicant.user_id == current_user.id).first()
    )

    if db_job_applicant:
        db_job_applicant.full_name = job_applicant.full_name
        db_job_applicant.birth_date = job_applicant.birth_date
        db_job_applicant.city = job_applicant.city
        db_job_applicant.country = job_applicant.country
        db_job_applicant.gender = job_applicant.gender
        db_job_applicant.education = job_applicant.education

        if job_applicant.profile_picture:
            db_job_applicant.profile_picture = save_image(job_applicant.profile_picture)

        if job_applicant.cv_files:
            db_job_applicant.cv_files = save_documents(job_applicant.cv_files)

        db.commit()
        db.refresh(db_job_applicant)
        return JobApplicantRead.from_orm(db_job_applicant)

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
    return (
        db.query(JobApplicant).filter(JobApplicant.user_id == job_applicant_id).first()
    )
