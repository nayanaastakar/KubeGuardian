@echo off
echo 🚀 Setting up KubeGuardian AI - MERN Stack DevSecOps Board Game
echo ==================================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
) else (
    echo ✅ npm is installed
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
) else (
    echo ✅ Docker is installed
)

REM Install backend dependencies
echo.
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
) else (
    echo ✅ Backend dependencies installed successfully
)

REM Install frontend dependencies
echo.
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
) else (
    echo ✅ Frontend dependencies installed successfully
)

REM Install AI service dependencies
echo.
echo 📦 Installing AI service dependencies...
cd ..\ai-service
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install AI service dependencies
    pause
    exit /b 1
) else (
    echo ✅ AI service dependencies installed successfully
)

REM Build backend
echo.
echo 🏗️  Building backend...
cd ..\backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build backend
    pause
    exit /b 1
) else (
    echo ✅ Backend built successfully
)

REM Build frontend
echo.
echo 🏗️  Building frontend...
cd ..\frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
) else (
    echo ✅ Frontend built successfully
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 🚀 To run the project:
echo.
echo Option 1 - Development Mode:
echo   Terminal 1: cd backend && npm run dev
echo   Terminal 2: cd frontend && npm run dev
echo   Terminal 3: cd ai-service && uvicorn app.main:app --reload
echo.
echo Option 2 - Docker Mode:
echo   docker-compose up -d
echo.
echo 🌐 Access the application:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   AI Service: http://localhost:8001
echo   MongoDB: mongodb://localhost:27017
echo   Redis: redis://localhost:6379
echo.
echo 📊 Monitoring (if enabled):
echo   Prometheus: http://localhost:9090
echo   Grafana: http://localhost:3001 (admin/admin)
echo.
pause
