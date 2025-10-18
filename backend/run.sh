#!/bin/bash

# PolyGrand Backend Startup Script

echo "🚀 Starting PolyGrand Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/bin/uvicorn" ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration!"
fi

# Start the server
echo "✅ Starting FastAPI server..."
echo "📊 API Docs: http://localhost:8000/docs"
echo "🌐 API: http://localhost:8000"
echo ""

uvicorn app:app --reload --host 0.0.0.0 --port 8000
