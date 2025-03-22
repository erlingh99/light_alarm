# Alarm Project Backend

A FastAPI backend service for managing alarms with SQLite storage and file-based persistence.

## Features

- 🚀 FastAPI for high-performance API endpoints
- 💾 SQLite database with SQLModel ORM
- 📝 File-based alarm storage with JSON serialization
- 🔄 Support for recurring alarm patterns
- 📈 Customizable intensity curves
- 🔒 Type-safe API with Pydantic models
- 📚 Automatic API documentation

## Prerequisites

- Python 3.10 or higher
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
uvicorn app.main:app --reload
```

2. Access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

- `GET /api/alarms` - List all alarms
- `GET /api/alarms/{alarm_id}` - Get a specific alarm
- `POST /api/alarms` - Create a new alarm
- `PUT /api/alarms/{alarm_id}` - Update an existing alarm
- `DELETE /api/alarms/{alarm_id}` - Delete an alarm

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Main FastAPI application
│   ├── models/
│   │   ├── __init__.py
│   │   └── alarm.py        # Pydantic models
│   ├── routes/
│   │   ├── __init__.py
│   │   └── alarms.py       # API routes
│   └── storage/
│       ├── __init__.py
│       └── alarms.py       # File storage operations
├── pyproject.toml          # Project metadata and dependencies
├── requirements.txt        # Python dependencies
└── alarms.json            # JSON file for alarm storage
```

## Development

### Technologies Used

- FastAPI - Web framework
- SQLModel - SQL database ORM
- Pydantic - Data validation
- UV - Dependency management
- SQLite - Database

### Data Models

- `Alarm`: Main alarm model with properties like name, time, color, etc.
- `RecurrencePattern`: Defines alarm recurrence (daily, weekly, custom)
- `IntensityCurve`: Controls alarm intensity over time

## Deployment

### Option 1: Direct Deployment

1. Install dependencies:
```bash
uv pip install -r requirements.txt
```

2. Start the server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Option 2: Docker

1. Build the Docker image:
```bash
docker build -t alarm-backend .
```

2. Run the container:
```bash
docker run -p 8000:8000 alarm-backend
```

### Production Considerations

1. Use a production-grade ASGI server (e.g., Gunicorn with Uvicorn workers)
2. Set up proper CORS configuration for your frontend domain
3. Implement proper error handling and logging
4. Consider using environment variables for configuration
5. Set up proper backup for the `alarms.json` file

## Environment Variables

- `BACKEND_HOST`: Host to bind the server to (default: 0.0.0.0)
- `BACKEND_PORT`: Port to run the server on (default: 8000)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 