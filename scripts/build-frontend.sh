#!/bin/bash

# Exit on error
set -e

echo "🚀 Building frontend..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Frontend build complete!" 