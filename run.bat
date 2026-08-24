@echo off
TITLE CodeJudge AI Platform Launcher
CLS

echo ===================================================
echo          Starting CodeJudge AI Platform
echo ===================================================
echo.

echo [1/3] Starting Local Ollama Model (qwen2.5-coder:7b)...
start "CodeJudge AI - Ollama" cmd /k "ollama run qwen2.5-coder:7b"

echo [2/3] Starting Backend Server (Python FastAPI on port 5000)...
start "CodeJudge AI - Backend" cmd /k "cd /d %~dp0backend && python main.py"

echo [3/3] Starting Frontend Server (Vite on port 5173)...
start "CodeJudge AI - Frontend" cmd /k "cd /d %~dp0replit-frontend\artifacts\codejudge-ai && npm run dev"

echo.
echo ===================================================
echo   All 3 services launched successfully!
echo   - Ollama Model: qwen2.5-coder:7b (http://localhost:11434)
echo   - Backend API:  http://localhost:5000
echo   - Frontend App: http://localhost:5173
echo ===================================================
echo.
pause
