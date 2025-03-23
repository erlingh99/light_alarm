#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment...${NC}"

# Build frontend
echo -e "${BLUE}📦 Building frontend...${NC}"
./scripts/build-frontend.sh

# Build and start Docker containers
echo -e "${BLUE}🐳 Building and starting Docker containers...${NC}"
docker compose up -d --build

# Wait for the application to be ready
echo -e "${BLUE}⏳ Waiting for application to be ready...${NC}"
sleep 5

# Check if the application is running
if curl -s http://localhost/api/alarms > /dev/null; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
    echo -e "${GREEN}🌐 Access the application at: http://localhost${NC}"
else
    echo -e "${RED}❌ Application failed to start${NC}"
    echo -e "${BLUE}📝 Checking logs...${NC}"
    docker compose logs
    exit 1
fi 