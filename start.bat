@echo off
TITLE CodeJudge AI Launcher
CLS

ECHO ===================================================
ECHO       🚀 Starting CodeJudge AI Platform 🚀
ECHO ===================================================
ECHO.

:: Check Python availability
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Python is not installed or not in PATH!
    PAUSE
    EXIT /B 1
)

:: Check npm availability
npm --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Node.js/npm is not installed or not in PATH!
    PAUSE
    EXIT /B 1
)

:: Check Ollama availability & launch model
ollama --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO [WARNING] Ollama is not found in PATH! Skipping local Ollama startup.
) ELSE (
    ECHO [1/3] Starting Local Ollama Model (qwen2.5-coder:7b)...
    START "CodeJudge AI - Ollama (qwen2.5-coder:7b)" cmd /k "ollama run qwen2.5-coder:7b"
)

ECHO [2/3] Starting Backend Server (Python FastAPI on port 5000)...
START "CodeJudge AI - Backend (Port 5000)" cmd /k "cd /d %~dp0backend && python main.py"

ECHO [3/3] Starting Frontend Server (Vite)...
START "CodeJudge AI - Frontend" cmd /k "cd /d %~dp0new-frontend && npm run dev"

ECHO.
ECHO ===================================================
ECHO  ✅ All 3 services launched!
ECHO  - Ollama Model: qwen2.5-coder:7b (http://localhost:11434)
ECHO  - Backend API:  http://localhost:5000
ECHO  - Frontend App: http://localhost:5173 / http://localhost:8080
ECHO ===================================================
ECHO.
PAUSE
