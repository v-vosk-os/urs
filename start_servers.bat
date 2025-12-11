@echo off
echo Starting URS Backend Servers...
echo ================================

cd backend

REM Check for virtual environment and activate if exists
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

echo.
REM Start the main backend server
echo Starting main backend server on port 8000...
start "URS Backend Server" cmd /k "python server.py"

REM Wait a moment before starting the MCP server
timeout /t 2 /nobreak >nul

REM Start the MCP server
echo Starting MCP server on port 8001...
start "URS MCP Server" cmd /k "python mcp_server.py"

cd ..

echo ================================
echo Servers are starting up...
echo.
echo Main Backend: http://localhost:8000
echo MCP Server:   http://localhost:8001
echo.
echo To stop servers, close the command windows.
echo.
pause