#!/bin/bash

echo "🚀 Setting up KubeGuardian AI - MERN Stack DevSecOps Board Game"
echo "=================================================================="

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install $1 first."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "🔍 Checking required tools..."
check_tool "node"
check_tool "npm"
check_tool "docker"
check_tool "docker-compose"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Install AI service dependencies
echo ""
echo "📦 Installing AI service dependencies..."
cd ../ai-service
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    echo "✅ AI service dependencies installed successfully"
else
    echo "❌ Failed to install AI service dependencies"
    exit 1
fi

# Build backend
echo ""
echo "🏗️  Building backend..."
cd ../backend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Backend built successfully"
else
    echo "❌ Failed to build backend"
    exit 1
fi

# Build frontend
echo ""
echo "🏗️  Building frontend..."
cd ../frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Failed to build frontend"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To run the project:"
echo ""
echo "Option 1 - Development Mode:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo "  Terminal 3: cd ai-service && uvicorn app.main:app --reload"
echo ""
echo "Option 2 - Docker Mode:"
echo "  docker-compose up -d"
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  AI Service: http://localhost:8001"
echo "  MongoDB: mongodb://localhost:27017"
echo "  Redis: redis://localhost:6379"
echo ""
echo "📊 Monitoring (if enabled):"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana: http://localhost:3001 (admin/admin)"
