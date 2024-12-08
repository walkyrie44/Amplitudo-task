from datetime import datetime, timedelta
from typing import Union
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from database.session import get_db
from database.models import User
from sqlalchemy.orm import Session
from config import SECRET_KEY, ALGORITHM
from fastapi.security import OAuth2PasswordBearer


def create_access_token(
    data: dict, expires_delta: Union[timedelta, None] = None
) -> str:
    to_encode = data.copy()

    if expires_delta is None:
        expires_delta = timedelta(minutes=30)

    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        payload = verify_token(token)
        if payload is None:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials."
            )

        user_id: int = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials."
            )

        user = db.query(User).filter(User.email == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found.")

        user.role_id = role
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials.")


def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role_id != 1:
        raise HTTPException(
            status_code=403, detail="You do not have permission to perform this action."
        )
    return current_user
