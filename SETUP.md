# 🚀 KubeGuardian AI - MERN Stack DevSecOps Board Game Setup

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) 
- **Python** (v3.11 or higher)
- **pip** (latest)
- **Docker** (latest)
- **Docker Compose** (latest)
- **MongoDB** (optional, included in Docker)

## 🛠 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd "KubeGuardian AI – Cloud Native DevSecOps Automation Platform"

# Run the automated setup script
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
npm install
npm run build
```

#### Frontend Setup  
```bash
cd frontend
npm install
npm run build
```

#### AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
```

## 🚀 Running the Application

### Development Mode

Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - AI Service:**
```bash
cd ai-service
uvicorn app.main:app --reload
```

### Docker Mode (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Access Points

Once running, access the application at:

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **AI Service**: http://localhost:8001
- **API Documentation**: http://localhost:8000/api-docs

## 📊 Monitoring Stack (Optional)

If monitoring is enabled:

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379

## 🔧 Configuration

### Environment Variables

Create `.env` files in each service directory:

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

## 🎮 DevSecOps Board Game

The application features an **18-level progressive DevSecOps board game**:

### ✅ Completed Levels (1-10)
1. **Project Setup** - MERN stack structure
2. **Frontend Development** - React components & routing
3. **Backend API** - REST API with authentication
4. **Database Setup** - MongoDB with Mongoose
5. **DevSecOps Features** - Security scanning & monitoring
6. **Kubernetes Management** - Cluster management
7. **Vulnerability Scanning** - CVE tracking & reporting
8. **Real-time Monitoring** - Alerts & metrics
9. **CI/CD Pipeline** - GitHub Actions automation
10. **Compliance & Audit** - CIS, OWASP, NIST reporting

### 🔄 Features Implemented

#### 🎮 **Gamification**
- Progressive difficulty levels
- Score tracking and badges
- Interactive level cards
- Requirements validation

#### 🏛 **Security Features**
- Vulnerability management
- Real-time alerts
- Compliance reporting
- Audit logging

#### 📈 **Monitoring & Observability**
- Cluster health monitoring
- Resource usage tracking
- Performance metrics
- Alert management

#### 🔄 **CI/CD Automation**
- Automated testing
- Security scanning
- Docker builds
- Kubernetes deployment

## 🛠 Troubleshooting

### Common Issues

#### TypeScript Errors
```bash
# Install missing type definitions
npm install --save-dev @types/node @types/express @types/cors

# Rebuild TypeScript
npm run build
```

#### Port Conflicts
```bash
# Check what's running on ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Kill processes using ports
sudo kill -9 <PID>
```

#### Docker Issues
```bash
# Clean Docker system
docker system prune -a

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Getting Help

1. **Check logs**: `docker-compose logs <service-name>`
2. **Verify ports**: Ensure no conflicts
3. **Check environment**: Verify `.env` files
4. **Rebuild**: `docker-compose down && docker-compose up --build`

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Clusters
- `GET /api/clusters` - List clusters
- `POST /api/clusters` - Connect cluster
- `PUT /api/clusters/:id` - Update cluster
- `DELETE /api/clusters/:id` - Remove cluster

### Security
- `GET /api/security/overview` - Security overview
- `GET /api/security/vulnerabilities` - List vulnerabilities
- `POST /api/security/vulnerabilities` - Create vulnerability
- `GET /api/security/stats` - Security statistics

### Compliance
- `GET /api/compliance/overview` - Compliance overview
- `GET /api/compliance/cis-benchmark` - CIS report
- `GET /api/compliance/owasp` - OWASP report
- `GET /api/compliance/nist` - NIST report
- `POST /api/compliance/generate-report` - Generate report

### AI Assistant
- `POST /api/ai/chat` - AI chat
- `POST /api/ai/analyze-logs` - Log analysis
- `POST /api/ai/security-analysis` - Security analysis
- `GET /api/ai/insights` - AI insights

## 🎯 Next Steps

After setup:

1. **Explore the Dashboard** - Navigate through the DevSecOps Board Game
2. **Connect a Cluster** - Add your Kubernetes cluster
3. **Run Security Scans** - Test vulnerability detection
4. **Monitor Metrics** - View real-time monitoring data
5. **Try AI Assistant** - Ask security questions
6. **Check Compliance** - Generate compliance reports

## 📞 Support

For issues and questions:

1. Check this SETUP.md file
2. Review application logs
3. Verify configuration
4. Check GitHub Issues

---

**🎉 Congratulations!** Your MERN Stack DevSecOps Board Game is now ready to use!
