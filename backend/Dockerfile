# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml requirements.txt ./
COPY app ./app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend build
COPY ../frontend/dist /app/frontend/dist

# Expose port
EXPOSE 80

# Set environment variables
ENV BACKEND_HOST=0.0.0.0
ENV BACKEND_PORT=80

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"] 