@echo off
REM ChatApp Startup Script for Windows
REM This script starts the chat application in production mode

echo Starting ChatApp...

REM Navigate to backend directory
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Error: Virtual environment not found. Please run setup first.
    echo Run: python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate

REM Start the application
echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
python src\main.py

pause

