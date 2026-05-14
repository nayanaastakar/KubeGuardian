@echo off
echo 🚀 STARTING KUBEGUARDIAN AI - MERN STACK DEVSECOPS BOARD GAME
echo ==========================================================

echo 📋 Step 1: Create Environment Files
echo.

REM Backend .env
cd backend
echo NODE_ENV=development > .env
echo MONGODB_URI=mongodb://localhost:27017/kubeguardian >> .env
echo JWT_SECRET=dev-secret-key >> .env
echo REDIS_URL=redis://localhost:6379 >> .env
echo AI_SERVICE_URL=http://localhost:8001 >> .env
echo FRONTEND_URL=http://localhost:3000 >> .env
echo ✅ Backend .env created

REM Frontend .env.local
cd ..\frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
echo NEXT_PUBLIC_WS_URL=ws://localhost:8000 >> .env.local
echo ✅ Frontend .env.local created

echo 📋 Step 2: Quick Install Dependencies
echo.

cd ..\backend
call npm install --production=false --force
cd ..\frontend
call npm install --production=false --force

echo 📋 Step 3: Start Services
echo.

echo 💡 Starting Backend (Port 8000)...
cd ..\backend
start "Backend" /min cmd /k "npm run dev"

echo 💡 Starting Frontend (Port 3000)...
cd ..\frontend
start "Frontend" /min cmd /k "npm run dev"

echo.
echo 🎉 SERVICES STARTED!
echo.
echo 🌐 Access DevSecOps Board Game at: http://localhost:3000
echo 📊 Backend API at: http://localhost:8000
echo 💡 If services fail, check individual terminal windows for errors
echo.
echo 🎮 Ready to explore 18-level DevSecOps Board Game!
pause
