@echo off
echo ==================================================================
echo   KubeGuardian AI - Cloud Native DevSecOps Platform Setup
echo ==================================================================
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [OK] Node.js and npm verified.
echo.
echo Installing root and workspace dependencies...
call npm install

echo.
echo Building backend server...
call npm run build:server

echo.
echo Building frontend client...
call npm run build:client

echo.
echo Running automated verification tests...
call npm test

echo.
echo ==================================================================
echo   KubeGuardian AI Platform Setup & Verification Complete!
echo   To launch development mode: start-dev.bat (or 'npm run dev')
echo ==================================================================
pause
