# Use Python 3.10 slim image
FROM python:3.10-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
#RUN apt update && apt install -y \
#    build-essential \
#    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY ./backend/pyproject.toml ./backend/requirements.txt ./
COPY ./backend/app ./app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir fastapi[standard]

# Copy frontend build
COPY ./frontend/dist /app/frontend/dist

# Expose port
EXPOSE 80

# Set environment variables
ENV BACKEND_HOST=0.0.0.0
ENV BACKEND_PORT=80

# Run the application
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "80"] 
