@echo off
title KisanBazaar Node.js Server
color 0B
echo.
echo ============================================
echo   KisanBazaar Web Server - Starting...
echo ============================================
echo.

cd /d "%~dp0kisanbazar-main\kisanbazaar"

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Download Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Starting server on port 8080...
echo.
echo    App: http://localhost:8080
echo.
echo    Keep this window open while using KisanBazaar
echo.
echo ============================================

node server.js

pause
