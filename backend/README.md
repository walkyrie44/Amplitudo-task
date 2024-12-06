## How to run the application locally
1. Create a virtual environment by typing: `python3.12 -m venv venv`

2. Activate the virtual environment
    - Windows: `./venv/Scripts/activate`
    - Unix / MacOS: `source venv/bin/activate`

3. Install requirements by typing: `pip install -r requirements.txt`

4. Create .env file
    - SECRET_KEY=secret-key
    - ALGORITHM=HS256=HS256
    - DATABASE_URL=database-url

5. Run the app from IDE or from the command line: `python -m uvicorn src.main:app --reload`    

6. Check the application docs at: `http://localhost:8000/docs`

## Code Style
To avoid code style issues, we're using Ruff.
Before committing your changes, run the following commands:
```bash
1. ruff check src/ --exclude=src/alembic/
2. ruff format src/ --exclude=src/alembic/