#!/bin/bash

# PolyGrand - Start Script
# This script starts both frontend and backend services

echo "🚀 Starting PolyGrand..."
echo ""

# Check if Python virtual environment exists
if [ ! -d ".venv" ]; then
    echo "⚠️  Python virtual environment not found. Creating one..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "✅ Activating Python virtual environment..."
source .venv/bin/activate

# Install Python dependencies if needed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip install -r backend/requirements.txt
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "🎯 Starting services..."
echo "   - Backend (FastAPI): http://localhost:8000"
echo "   - Frontend (Vite): http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start both services
npm run dev
