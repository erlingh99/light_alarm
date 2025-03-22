# Alarm Project Backend

This is the backend service for the Alarm Project, built with FastAPI and SQLite.

## Prerequisites

- Python 3.8 or higher
- UV package installer (recommended) or pip

## Setup with UV (Recommended)

1. Install UV if you haven't already:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Create and activate a virtual environment:
```bash
uv venv
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate  # On Windows
```

3. Install dependencies:
```bash
uv pip install -e .
```

## Setup with pip (Alternative)

1. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate  # On Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the development server:
```bash
uvicorn backend_test:app --reload
```

2. Access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

- `backend_test.py`: Main FastAPI application with database models and API endpoints
- `pyproject.toml`: Project metadata and dependencies
- `alarms.db`: SQLite database file (created automatically on first run)

## Development

The project uses:
- FastAPI for the web framework
- SQLAlchemy for database ORM
- Pydantic for data validation
- UV for dependency management 