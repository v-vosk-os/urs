@echo off
echo URS Chrome Extension Setup
echo ==========================
echo.

echo Step 1: Python Environment Setup
echo It is recommended to use a virtual environment to avoid conflicts.
set /p CREATE_VENV="Do you want to create a new virtual environment? (Y/N) [Default: Y]: "
if "%CREATE_VENV%"=="" set CREATE_VENV=Y

if /i "%CREATE_VENV%"=="Y" (
    echo Creating virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    echo Virtual environment activated.
    cd ..
)

echo.
echo Step 2: Installing Python dependencies...
cd backend
echo Installing updated requirements...
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo WARNING: Some conflicts may still exist, but we attempted to install compatible versions.
    echo If the server fails to start, try creating a fresh virtual environment.
)
cd ..

echo.
echo Step 3: Creating .env file...
if not exist backend\.env (
    echo Creating .env file from template...
    copy backend\env_example.txt backend\.env
    echo.
    echo IMPORTANT: Please edit backend\.env and add your API keys.
    echo A configuration script is available if you have keys ready.
    
    set /p RUN_CONFIG="Do you want to run the auto-configuration script? (Y/N): "
    if /i "%RUN_CONFIG%"=="Y" (
        cd backend
        python configure_env.py
        cd ..
    ) else (
        echo Opening .env for manual editing...
        notepad backend\.env
    )
) else (
    echo .env file already exists. Skipping...
)

echo.
echo Step 4: Setup complete!
echo.
echo Next steps:
echo 1. If you created a venv, remember to activate it before running servers:
echo    cd backend ^&^& venv\Scripts\activate ^&^& cd ..
echo 2. Run start_servers.bat to start the backend servers
echo 3. Load the "urs" folder in chrome://extensions/
echo.
pause