@echo off
REM PolyGrand Backend Startup Script for Windows

echo Starting PolyGrand Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies if needed
if not exist "venv\Scripts\uvicorn.exe" (
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Check if .env exists
if not exist ".env" (
    echo No .env file found. Copying from .env.example...
    copy .env.example .env
    echo Please edit .env with your configuration!
)

REM Start the server
echo Starting FastAPI server...
echo API Docs: http://localhost:8000/docs
echo API: http://localhost:8000
echo.

uvicorn app:app --reload --host 0.0.0.0 --port 8000
