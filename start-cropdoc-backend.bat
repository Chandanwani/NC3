@echo off
title CropDoc AI - Python Backend
color 0A
echo.
echo ============================================
echo   CropDoc AI Backend - Starting...
echo ============================================
echo.

cd /d "%~dp0Crop-disease-main\backend"

echo [1/3] Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Download Python from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo [2/3] Installing dependencies (first time only)...
pip install fastapi uvicorn motor python-dotenv httpx emergentintegrations pydantic google-genai 2>nul

echo.
echo [3/3] Starting CropDoc AI server on port 8000...
echo.
echo    API: http://localhost:8000/api
echo    Docs: http://localhost:8000/docs
echo.
echo    Make sure KisanBazaar is running on port 8080
echo    Keep this window open while using CropDoc AI
echo.
echo ============================================

uvicorn server:app --host 0.0.0.0 --port 8000 --reload

pause
