# Use Python 3.10 slim image
FROM python:3.10-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
#RUN apt update && apt install -y \
#    build-essential \
#    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY ./backend ./backend

# Install Python dependencies
RUN pip install --no-cache-dir -r ./backend/requirements.txt
# RUN pip install --no-cache-dir fastapi[standard]

# Copy frontend build
COPY ./frontend/dist ./frontend/dist

# Run the application
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"] 
