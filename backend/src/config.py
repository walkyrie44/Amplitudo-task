from decouple import config

SECRET_KEY = config("SECRET_KEY")
ALGORITHM = config("ALGORITHM")
DATABASE_URL = config("DATABASE_URL")
