from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from database.db import Base
from sqlalchemy.dialects.postgresql import JSON


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String, nullable=True)
    photo = Column(String, nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    role = relationship("Role", back_populates="users")
    job_applicant = relationship("JobApplicant", back_populates="user", uselist=False)


class JobApplicant(Base):
    __tablename__ = "job_applicants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String, index=True)
    birth_date = Column(Date)
    city = Column(String)
    country = Column(String)
    gender = Column(String)
    education = Column(String)
    cv_files = Column(JSON, default=[])
    profile_picture = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="job_applicant")
