@echo off
echo 🚀 CLEAN START - KubeGuardian AI MERN Stack DevSecOps Board Game
echo =============================================================

echo 📋 Step 1: Fix Environment Files
echo.

REM Create clean environment files
cd backend
echo NODE_ENV=development > .env
echo MONGODB_URI=mongodb://localhost:27017/kubeguardian >> .env
echo JWT_SECRET=dev-secret-key-12345 >> .env
echo REDIS_URL=redis://localhost:6379 >> .env
echo AI_SERVICE_URL=http://localhost:8001 >> .env
echo FRONTEND_URL=http://localhost:3000 >> .env
echo ✅ Backend .env created

cd ..\frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
echo NEXT_PUBLIC_WS_URL=ws://localhost:8000 >> .env.local
echo ✅ Frontend .env.local created

echo 📋 Step 2: Fix Dependencies
echo.

cd ..\backend
echo 📦 Installing backend dependencies...
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Backend install failed
    pause
    exit /b 1
)

echo 📦 Fixing vulnerabilities...
call npm audit fix --force

cd ..\frontend
echo 📦 Installing frontend dependencies...
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Frontend install failed
    pause
    exit /b 1
)

echo 📦 Fixing vulnerabilities...
call npm audit fix --force

echo 📋 Step 3: Start Services
echo.

echo 💡 Starting Backend Server...
cd ..\backend
start "Backend Server" cmd /k "npm run dev"

timeout /t 5 >nul

echo 💡 Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 🎉 SERVICES STARTED SUCCESSFULLY!
echo.
echo 🌐 Access the DevSecOps Board Game at:
echo    🎮 Frontend: http://localhost:3000
echo    🔧 Backend API: http://localhost:8000
echo    📊 Health Check: http://localhost:8000/health
echo.
echo 💡 Wait 10 seconds for services to fully start...
timeout /t 10 >nul

echo 🎮 MERN Stack DevSecOps Board Game is READY!
echo    - Explore 18 progressive levels
echo    - Interactive security dashboard
echo    - Real-time monitoring
echo    - AI-powered insights
echo.
pause
