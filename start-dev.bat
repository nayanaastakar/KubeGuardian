@echo off
echo 🚀 Starting KubeGuardian AI - MERN Stack DevSecOps Board Game
echo ==================================================================

echo 📦 Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo 📦 Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo 🤖 Starting AI Service...
cd ..\ai-service
start "AI Service" cmd /k "uvicorn app.main:app --reload"

echo.
echo ✅ All servers started in separate windows!
echo.
echo 🌐 Access the application at:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   AI Service: http://localhost:8001
echo.
echo 💡 Close this window to stop all servers
pause
