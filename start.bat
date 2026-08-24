@echo off
TITLE CodeJudge AI Platform Launcher
CLS

echo ===================================================
echo          Starting CodeJudge AI Platform
echo ===================================================
echo.

echo [1/5] Starting Local Ollama Model (qwen2.5-coder:7b)...
start "CodeJudge AI - Ollama" cmd /k "ollama run qwen2.5-coder:7b"

echo [2/5] Starting Backend Part 1 (Port 5000 - Intent, Logic, Test Case)...
start "CodeJudge AI - Backend Part 1 (5000)" cmd /k "cd /d %~dp0backend && python main_part1.py"

echo [3/5] Starting Backend Part 2 (Port 5001 - Complexity, Hardcoding, Security)...
start "CodeJudge AI - Backend Part 2 (5001)" cmd /k "cd /d %~dp0backend && python main_part2.py"

echo [4/5] Starting Backend Part 3 (Port 5002 - Adversarial, Feedback, Master Judge)...
start "CodeJudge AI - Backend Part 3 (5002)" cmd /k "cd /d %~dp0backend && python main_part3.py"

echo [5/5] Starting Frontend Server (Vite on port 5173)...
start "CodeJudge AI - Frontend" cmd /k "cd /d %~dp0replit-frontend\artifacts\codejudge-ai && npm run dev"

echo.
echo ===================================================
echo   All 5 services launched successfully!
echo   - Ollama Model:   qwen2.5-coder:7b (http://localhost:11434)
echo   - Backend Part 1: http://localhost:5000
echo   - Backend Part 2: http://localhost:5001
echo   - Backend Part 3: http://localhost:5002
echo   - Frontend App:   http://localhost:5173
echo ===================================================
echo.
pause
