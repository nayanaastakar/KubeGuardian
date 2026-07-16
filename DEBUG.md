# 🔍 Debug Guide - MERN Stack DevSecOps Board Game

## Current Issues & Solutions

### 1. Backend Issues

#### Problem: TypeScript Path Resolution
**Issue**: `Cannot find module '@/routes/compliance'`
**Solution**: Update tsconfig.json paths and ensure proper imports

#### Problem: Missing Dependencies
**Issue**: `rate-limiter-flexible` version conflict
**Status**: ✅ FIXED - Updated to version ^2.4.2

#### Problem: Missing nodemon
**Issue**: `'nodemon' is not recognized`
**Status**: ✅ FIXED - Dependencies installed successfully

### 2. Frontend Issues

#### Problem: Next.js Version Vulnerability
**Issue**: `This version has a security vulnerability`
**Solution**: Update Next.js to latest stable version

#### Problem: React Beautiful DND Deprecated
**Issue**: `react-beautiful-dnd is now deprecated`
**Solution**: Consider migrating to @dnd-kit or @dnd/core

### 3. Docker Issues

#### Problem: Docker Desktop Not Running
**Issue**: `failed to connect to the docker API`
**Solution**: Start Docker Desktop application

#### Problem: Missing Environment Variables
**Issue**: `OPENAI_API_KEY variable is not set`
**Solution**: Create .env files in each service

## 🔧 Quick Fixes

### Fix 1: Update Frontend Dependencies
```bash
cd frontend
npm update next@latest
npm audit fix
```

### Fix 2: Create Environment Files
**Backend (.env):**
```
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kubeguardian
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
AI_SERVICE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

**AI Service (.env):**
```
OPENAI_API_KEY=your-openai-api-key
MONGODB_URI=mongodb://localhost:27017/kubeguardian
```

### Fix 3: Start Services Manually

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Fix 4: Docker Mode (Alternative)

If Docker isn't working, try:
```bash
# Start Docker Desktop first
# Then run:
docker-compose up -d --build
```

## 🚀 Working Solution

### Step-by-Step:

1. **Start Docker Desktop** (if using Docker)
2. **Install dependencies** for each service
3. **Create .env files** with proper configuration
4. **Start services** in separate terminals
5. **Access application** at http://localhost:3000

### Verification Commands:

```bash
# Check if ports are available
netstat -an | findstr :3000
netstat -an | findstr :8000
netstat -an | findstr :8001

# Check Docker status
docker ps
docker-compose ps

# Check service logs
docker-compose logs backend
docker-compose logs frontend
```

## 📞 Common Error Messages & Solutions

| Error | Solution |
|--------|----------|
| `Cannot find module` | Check tsconfig.json paths and imports |
| `Port already in use` | Kill process using the port |
| `Docker connection failed` | Start Docker Desktop |
| `npm install failed` | Clear npm cache: `npm cache clean --force` |
| `TypeScript compilation failed` | Check tsconfig.json and fix type errors |

## 🎯 Next Steps

1. **Run the manual setup** using the commands above
2. **Check each service individually** before combining
3. **Verify environment variables** are set correctly
4. **Test API endpoints** with Postman or curl
5. **Access frontend** and check browser console for errors

---

**💡 Tip**: Start with one service at a time to isolate issues!
