@echo off
REM PolyGrand - Start Script for Windows
REM This script starts both frontend and backend services

echo 🚀 Starting PolyGrand...
echo.

REM Check if Python virtual environment exists
if not exist ".venv" (
    echo ⚠️  Python virtual environment not found. Creating one...
    python -m venv .venv
)

REM Activate virtual environment
echo ✅ Activating Python virtual environment...
call .venv\Scripts\activate.bat

REM Install Python dependencies if needed
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo 📦 Installing Python dependencies...
    pip install -r backend\requirements.txt
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing npm dependencies...
    npm install
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo 🎯 Starting services...
echo    - Backend (FastAPI): http://localhost:8000
echo    - Frontend (Vite): http://localhost:3000
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start both services
npm run dev
