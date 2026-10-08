@echo off
title Digital Print - Windows Print Agent
cls
echo ========================================================
echo   Digital Print - Windows Print Agent Starter
echo ========================================================
echo.

IF NOT EXIST "node_modules" (
  echo [INFO] Installing required dependencies...
  call npm install
)

echo [INFO] Starting Print Agent Daemon...
call npm start
pause
