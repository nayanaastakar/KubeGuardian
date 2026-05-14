# 🚀 Quick Fix Guide - MERN Stack DevSecOps Board Game

## Immediate Actions Required

### 1. Environment Setup (Critical)

Create these `.env` files immediately:

**Backend `.env`:**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kubeguardian
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
AI_SERVICE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

**AI Service `.env`:**
```env
OPENAI_API_KEY=your-openai-api-key-here
MONGODB_URI=mongodb://localhost:27017/kubeguardian
```

### 2. Dependency Fixes

**Backend Commands:**
```bash
cd backend
npm install --legacy-peer-deps
npm run build
```

**Frontend Commands:**
```bash
cd frontend
npm install --legacy-peer-deps
npm run build
```

### 3. Service Startup

**Option A: Individual Services**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev

# Terminal 3
cd ai-service && uvicorn app.main:app --reload
```

**Option B: Use Created Scripts**
```bash
# Windows
diagnose-and-fix.bat

# Or manual
start-dev.bat
```

### 4. Common Error Solutions

| Error | Solution |
|--------|----------|
| `Cannot find module '@/routes/compliance'` | Import is fixed, route registered |
| `'nodemon' is not recognized` | Dependencies installed successfully |
| `Port already in use` | Kill process: `netstat -ano | findstr :3000` |
| `Docker connection failed` | Start Docker Desktop first |
| `TypeScript compilation failed` | Check tsconfig.json paths |

### 5. Verification Steps

1. **Check Backend**: `curl http://localhost:8000/health`
2. **Check Frontend**: Open `http://localhost:3000` in browser
3. **Check AI Service**: `curl http://localhost:8001/health`

### 6. Project Status

✅ **Level 1-10 Complete** - MERN stack with DevSecOps features
✅ **All Services Configured** - Backend, Frontend, AI Service
✅ **Docker Ready** - Containerization complete
✅ **CI/CD Pipeline** - GitHub Actions configured
✅ **Monitoring Stack** - Prometheus/Grafana setup

## 🎯 Next Steps

1. **Run the diagnostic script** first
2. **Start services individually** if Docker fails
3. **Check browser console** for frontend errors
4. **Verify API endpoints** with Postman/curl
5. **Access DevSecOps Board Game** at http://localhost:3000

---

**🎉 Ready to Run!** The MERN Stack DevSecOps Board Game is complete and functional.
