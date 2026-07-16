@echo off
echo 🚀 FINAL FIX - KubeGuardian AI MERN Stack DevSecOps Board Game
echo ========================================================

echo 📋 Step 1: Clean and reinstall dependencies
echo.

cd backend
if exist "node_modules" (
    echo 🗑️  Cleaning backend node_modules...
    rmdir /s /q node_modules
)
echo 📦 Installing backend dependencies...
call npm install --legacy-peer-deps --force
if %errorlevel% neq 0 (
    echo ❌ Backend install failed
    pause
    exit /b 1
) else (
    echo ✅ Backend dependencies installed
)

cd ..\frontend
if exist "node_modules" (
    echo 🗑️  Cleaning frontend node_modules...
    rmdir /s /q node_modules
)
echo 📦 Installing frontend dependencies...
call npm install --legacy-peer-deps --force
if %errorlevel% neq 0 (
    echo ❌ Frontend install failed
    pause
    exit /b 1
) else (
    echo ✅ Frontend dependencies installed
)

cd ..\ai-service
if exist "venv" (
    echo 🗑️  Cleaning AI service venv...
    rmdir /s /q venv
)
echo 🐍 Creating AI service venv...
python -m venv venv
call venv\Scripts\activate
echo 📦 Installing AI service dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ AI service install failed
    pause
    exit /b 1
) else (
    echo ✅ AI service dependencies installed
)

echo.
echo 📋 Step 2: Create environment files
echo.

cd ..\backend
echo NODE_ENV=development > .env
echo MONGODB_URI=mongodb://localhost:27017/kubeguardian >> .env
echo REDIS_URL=redis://localhost:6379 >> .env
echo JWT_SECRET=dev-secret-key-change-in-production >> .env
echo AI_SERVICE_URL=http://localhost:8001 >> .env
echo FRONTEND_URL=http://localhost:3000 >> .env
echo ✅ Backend .env created

cd ..\frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
echo NEXT_PUBLIC_WS_URL=ws://localhost:8000 >> .env.local
echo ✅ Frontend .env.local created

cd ..\ai-service
echo OPENAI_API_KEY=sk-test-key-replace-with-real >> .env
echo MONGODB_URI=mongodb://localhost:27017/kubeguardian >> .env
echo ✅ AI Service .env created

echo.
echo 📋 Step 3: Build services
echo.

cd ..\backend
echo 🏗️  Building backend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    pause
    exit /b 1
) else (
    echo ✅ Backend built successfully
)

cd ..\frontend
echo 🏗️  Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
) else (
    echo ✅ Frontend built successfully
)

echo.
echo 📋 Step 4: Start services
echo.

echo 🚀 Starting all services...
echo.

echo 💡 Backend Server (Port 8000)...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 >nul

echo 💡 Frontend Server (Port 3000)...
start "Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 >nul

echo 💡 AI Service (Port 8001)...
start "AI Service" cmd /k "cd ai-service && venv\Scripts\activate && uvicorn app.main:app --reload"

echo.
echo 🎉 ALL SERVICES STARTED!
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    AI Service: http://localhost:8001
echo.
echo 📊 Health Check URLs:
echo    Backend Health: http://localhost:8000/health
echo    AI Service Health: http://localhost:8001/health
echo.
echo 💡 To stop all services: Close this window
echo.
echo 🎮 DevSecOps Board Game Ready! Explore the 18-level progressive security platform.
pause
