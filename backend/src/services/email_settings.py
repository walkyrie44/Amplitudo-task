import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from fastapi import Depends, HTTPException
from database.models import User

from services.security import get_current_user

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = os.getenv("SMTP_PORT")
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
VERIFICATION_URL = os.getenv("VERIFICATION_URL")


def send_verification_email(to_email: str, token: str):
    verification_url = VERIFICATION_URL + token

    subject = "Verify Your Email"
    body = f"""
    Hi,
    Please verify your email by clicking on the link below:
    {verification_url}
    """

    message = MIMEMultipart()
    message["From"] = EMAIL_USER
    message["To"] = to_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        print("Uspesno povezan sa Gmail serverom!")
        server.send_message(message)


def email_verification_required(current_user: User = Depends(get_current_user)):
    if not current_user.is_verified:
        raise HTTPException(
            status_code=403, detail="Email not verified. Please verify your email."
        )
    return current_user
