@echo off
echo 🔍 Diagnosing and Fixing KubeGuardian AI Issues
echo ================================================

echo 📋 Checking Node.js and npm versions...
node --version
npm --version

echo.
echo 📁 Checking project structure...
if exist "backend\src\index.ts" (
    echo ✅ Backend index.ts found
) else (
    echo ❌ Backend index.ts missing
)

if exist "frontend\app\page.tsx" (
    echo ✅ Frontend page.tsx found
) else (
    echo ❌ Frontend page.tsx missing
)

if exist "ai-service\app\main.py" (
    echo ✅ AI service main.py found
) else (
    echo ❌ AI service main.py missing
)

echo.
echo 📦 Checking backend dependencies...
cd backend
if exist "node_modules" (
    echo ✅ Backend node_modules exists
    npm list --depth=0
) else (
    echo ❌ Backend node_modules missing
    echo 📦 Installing backend dependencies...
    call npm install
)

echo.
echo 📦 Checking frontend dependencies...
cd ..\frontend
if exist "node_modules" (
    echo ✅ Frontend node_modules exists
    npm list --depth=0
) else (
    echo ❌ Frontend node_modules missing
    echo 📦 Installing frontend dependencies...
    call npm install
)

echo.
echo 🐍 Checking AI service dependencies...
cd ..\ai-service
if exist "venv" (
    echo ✅ Python venv exists
) else (
    echo ❌ Python venv missing
    echo 🐍 Creating Python venv...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
)

echo.
echo 🔧 Fixing common issues...

REM Fix 1: Create environment files
echo 📝 Creating environment files...
cd ..\backend
if not exist ".env" (
    echo NODE_ENV=development > .env
    echo MONGODB_URI=mongodb://localhost:27017/kubeguardian >> .env
    echo REDIS_URL=redis://localhost:6379 >> .env
    echo JWT_SECRET=your-super-secret-jwt-key >> .env
    echo AI_SERVICE_URL=http://localhost:8001 >> .env
    echo FRONTEND_URL=http://localhost:3000 >> .env
    echo ✅ Backend .env created
)

cd ..\frontend
if not exist ".env.local" (
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
    echo NEXT_PUBLIC_WS_URL=ws://localhost:8000 >> .env.local
    echo ✅ Frontend .env.local created
)

cd ..\ai-service
if not exist ".env" (
    echo OPENAI_API_KEY=your-openai-api-key > .env
    echo MONGODB_URI=mongodb://localhost:27017/kubeguardian >> .env
    echo ✅ AI Service .env created
)

echo.
echo 🏗️  Building backend...
cd ..\backend
call npm run build
if %errorlevel% equ 0 (
    echo ✅ Backend built successfully
) else (
    echo ❌ Backend build failed
)

echo.
echo 🏗️  Building frontend...
cd ..\frontend
call npm run build
if %errorlevel% equ 0 (
    echo ✅ Frontend built successfully
) else (
    echo ❌ Frontend build failed
)

echo.
echo 🚀 Starting services in development mode...
echo.
echo 💡 Starting backend server...
cd ..\backend
start "Backend Server" cmd /k "npm run dev"

timeout /t 3 >nul

echo 💡 Starting frontend server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

timeout /t 3 >nul

echo 💡 Starting AI service...
cd ..\ai-service
if exist "venv" (
    call venv\Scripts\activate
    start "AI Service" cmd /k "uvicorn app.main:app --reload"
) else (
    echo ❌ AI service venv not found
)

echo.
echo 🎉 Diagnosis and fix complete!
echo.
echo 🌐 Access the application at:
echo   Frontend: http://localhost:3000
echo   Backend: http://localhost:8000
echo   AI Service: http://localhost:8001
echo.
echo 💡 If any service fails to start, check the individual service directory for errors.
echo.
pause
