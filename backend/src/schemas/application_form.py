from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from enum import Enum


class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"


class JobApplicantCreate(BaseModel):
    full_name: str
    birth_date: date
    city: str
    country: str
    gender: GenderEnum
    education: str
    cv_files: Optional[List[str]] = []
    profile_picture: Optional[str] = None
    user_id: int

    class Config:
        orm_mode = True


class JobApplicantRead(BaseModel):
    id: int
    full_name: str
    birth_date: date
    city: str
    country: str
    gender: GenderEnum
    education: str
    cv_files: Optional[List[str]] = []
    profile_picture: Optional[str] = None
    user_id: int

    class Config:
        orm_mode = True


class JobApplicantUpdate(BaseModel):
    full_name: Optional[str] = None
    birth_date: Optional[date] = None
    city: Optional[str] = None
    country: Optional[str] = None
    gender: Optional[GenderEnum] = None
    education: Optional[str] = None
    cv_files: Optional[str] = None
    profile_picture: Optional[str] = None
    user_id: Optional[int] = None

    class Config:
        orm_mode = True
