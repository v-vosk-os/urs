@echo off
echo ========================================
echo Starting URS Backend Server
echo ========================================
echo.

cd /d "%~dp0"

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run setup.bat first.
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if .env exists in backend folder
if not exist "backend\.env" (
    echo WARNING: backend\.env file not found!
    echo Copying from env_example.txt...
    copy env_example.txt backend\.env
)

REM Start the backend server
echo Starting backend server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
cd backend
python server.py

pause

