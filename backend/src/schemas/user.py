from typing import Optional
from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    role_id: int = 2
    full_name: Optional[str] = None
    photo: Optional[str] = None


class UserOut(BaseModel):
    full_name: Optional[str] = None
    email: str
    photo: Optional[str] = None

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: str
    password: str
