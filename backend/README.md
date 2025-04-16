# Alarm Project Backend

A FastAPI backend service for managing alarms with file-based storage and curve modeling.

## Features

- 🚀 FastAPI for high-performance API endpoints
- 📝 File-based alarm storage with JSON serialization
- 🔄 Support for recurring alarm patterns
- 📈 Rich intensity curve modeling:
  - Linear, S-curve, asymptotic, and custom curves
  - Parameter validation and normalization
  - Control point handling for custom curves
- 🔒 Type-safe API with Pydantic models
- 📚 Automatic API documentation

## Prerequisites

- Python 3.10 or higher
- UV package installer (recommended) or pip
- Docker and Docker Compose (for containerized deployment)

## Setup with UV (Recommended)

1. Install UV:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Create and activate virtual environment:
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

2. Access the documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Documentation

### Endpoints

#### GET /api/alarms
List all alarms

Response:
```typescript
Array<{
  id: UUID;
  name: string;
  time: string;  // HH:MM format
  color: string; // Hex color
  length: number;
  intensityCurve: {
    startIntensity: number;  // 0-100
    endIntensity: number;    // 0-100
    curve: "linear" | "asymptotic" | "s-curve" | "custom";
    hyperParameter?: number;
    controlPoints?: Array<{x: number, y: number}>;
  };
  isActive: boolean;
  recurrence: {
    type: "daily" | "weekly" | "custom";
    days?: number[];         // 0-6 for weekly
    customDates?: string[];  // ISO dates
  };
}>
```

#### POST /api/alarms
Create new alarm

#### PUT /api/alarms/{alarm_id}
Update existing alarm

#### DELETE /api/alarms/{alarm_id}
Delete alarm

### Data Models

#### IntensityCurve
Controls how light intensity changes over time:
- **startIntensity**: Initial brightness (0-100)
- **endIntensity**: Final brightness (0-100)
- **curve**: Curve type
  - linear: Direct progression
  - s-curve: Smooth transition with configurable sharpness
  - asymptotic: Gradual approach with configurable decay
  - custom: User-defined points with spline interpolation
- **hyperParameter**: Optional curve-specific parameter
- **controlPoints**: Array of {x,y} points for custom curves

#### RecurrencePattern
Defines when alarms repeat:
- **type**: "daily", "weekly", or "custom"
- **days**: Array of weekdays (0-6) for weekly
- **customDates**: Array of dates for custom pattern

## Project Structure

```
backend/
├── app/
│   ├── models/
│   │   └── alarm.py        # Data models
│   ├── routes/
│   │   └── api.py          # API endpoints
│   ├── storage/
│   │   └── filestorage.py  # Storage logic
│   └── main.py             # Application setup
├── pyproject.toml          # Dependencies
└── alarms.json            # Data storage
```

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

### Option 2: Docker Deployment

1. Build and run using Docker Compose (recommended):
```bash
# Build and start the container
docker compose up --build

# Or run in detached mode
docker compose up -d --build

# Stop the container
docker compose down
```

2. Or build and run using Docker directly:
```bash
# Build the image
docker build -t alarm-backend .

# Run the container
docker run -p 8000:8000 -v $(pwd)/alarms.json:/app/alarms.json alarm-backend
```

### Production Considerations

1. Use a production-grade ASGI server (e.g., Gunicorn with Uvicorn workers)
2. Set up proper CORS configuration for your frontend domain
3. Implement proper error handling and logging
4. Consider using environment variables for configuration
5. Set up proper backup for the `alarms.json` file
6. Use Docker secrets or environment files for sensitive data
7. Consider using Docker networks for service isolation
8. Set up proper monitoring and logging

## Environment Variables

- `BACKEND_HOST`: Host to bind the server to (default: 0.0.0.0)
- `BACKEND_PORT`: Port to run the server on (default: 8000)
