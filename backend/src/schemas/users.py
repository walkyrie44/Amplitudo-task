from typing import Optional
from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    role_id: int = 2
    full_name: Optional[str] = None
    photo: Optional[str] = None


class UserOut(BaseModel):
    id: Optional[int] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    photo: Optional[str] = None

    class Config:
        orm_mode = True


class UserNameAndPhoto(BaseModel):
    full_name: Optional[str] = None
    photo: Optional[str] = None


class UpdateUser(BaseModel):
    full_name: Optional[str] = None
    photo: Optional[str] = None
    password: Optional[str] = None
