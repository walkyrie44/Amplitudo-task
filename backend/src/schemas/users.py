from typing import Optional
from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    role_id: int = 2
    full_name: Optional[str] = None
    photo: Optional[str] = None


class UserOut(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: str
    photo: Optional[str] = None

    class Config:
        orm_mode = True
