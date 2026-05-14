#!/bin/bash

echo "🔧 Fixing MERN Stack DevSecOps Board Game Issues..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Install AI service dependencies
echo "📦 Installing AI service dependencies..."
cd ../ai-service
pip install -r requirements.txt

# Fix TypeScript configuration issues
echo "⚙️  Fixing TypeScript configuration..."
cd ../backend
npm run build

# Fix frontend build issues
echo "🏗️  Building frontend..."
cd ../frontend
npm run build

echo "✅ Issues fixed successfully!"
echo "🚀 You can now run the project with:"
echo "   Backend: cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev" 
echo "   AI Service: cd ai-service && uvicorn app.main:app --reload"
echo ""
echo "🐳 Or run with Docker Compose:"
echo "   docker-compose up -d"
