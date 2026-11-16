
@echo off
title Incident Atlas Launcher

echo =====================================
echo       INCIDENT ATLAS
echo =====================================
echo.

set "PROJECT_DIR=%~dp0"

echo Starting FastAPI backend...
start "Incident Atlas Backend" cmd /k "cd /d ""%PROJECT_DIR%"" && python -m uvicorn app.api:app --reload"

echo Starting frontend server...
start "Incident Atlas Frontend" cmd /k "cd /d ""%PROJECT_DIR%frontend"" && python -m http.server 5500"

echo.
echo Waiting for servers to start...
timeout /t 4 /nobreak >nul

echo Opening Incident Atlas...
start "" "http://127.0.0.1:5500/"

echo.
echo Incident Atlas launch commands completed!
