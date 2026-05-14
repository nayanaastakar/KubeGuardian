# KubeGuardian AI – Cloud Native DevSecOps Automation Platform (MERN Stack)

> AI-powered Kubernetes security, monitoring, and DevSecOps automation platform built with **React + Vite**, **Express.js**, and **MongoDB**.

---

## 🎯 Overview

**KubeGuardian AI** is an enterprise-grade MERN (MongoDB, Express, React, Node.js) platform that combines:

- **Kubernetes Cluster Monitoring** — Real-time telemetry for nodes, pods, and deployments
- **AI Predictive Failure Detection** — Anticipate pod crashes and performance issues
- **Self-Healing Engine** — Auto-remediation for failed deployments and unhealthy pods
- **Vulnerability Scanning** — CVE detection and risk scoring using Trivy integration
- **DevSecOps Security Scoring** — Automated compliance and hardening analysis
- **Chaos Engineering** — Resilience testing and fault injection simulations
- **AI Troubleshooting Assistant** — Natural language Kubernetes command generation
- **Incident Management** — Unified timeline and alert correlation dashboard
- **Observability Stack** — Prometheus, Grafana, and Loki integration

---

## 🏗️ Architecture

### Modern MERN Stack

```
┌──────────────────────────────────────────────────────────────┐
│                      Client (React + Vite)                   │
│                  Modern SaaS-style dashboard                 │
│         Glassmorphism UI, Tailwind CSS, Framer Motion        │
│                                                              │
│  • Cluster monitoring          • AI Troubleshooting Assistant│
│  • Vulnerability reports       • Chaos engineering simulator │
│  • Incident timeline           • Security scoring dashboard  │
└──────────────────────────────────────────────────────────────┘
                            ▼
                        REST APIs
                      WebSockets (Socket.IO)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              Backend (Express.js + TypeScript)               │
│                   Modular Architecture                       │
│                  JWT Auth, RBAC, Rate Limiting               │
│                                                              │
│  • Authentication & Authorization    • AI Analysis APIs     │
│  • Cluster Management APIs           • Vulnerability Scanning│
│  • Incident & Alert Management       • Real-time Streaming  │
└──────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────┐
│        MongoDB (Document Storage)               │
│        Redis (Session & Caching Layer)          │
│        Prometheus (Metrics Collection)          │
│        Grafana (Visualization)                  │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Tech Stack

### Frontend

- **React 18** — UI library with hooks
- **Vite** — Lightning-fast build tool and dev server
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Smooth, performant animations
- **Recharts** — Interactive data visualization
- **Axios** — HTTP client
- **Zustand** — Lightweight state management
- **React Router DOM** — Client-side routing

### Backend

- **Node.js 20** — Runtime environment
- **Express.js** — Minimal web framework
- **TypeScript** — Type-safe server code
- **MongoDB** — NoSQL document database
- **Mongoose** — ODM with schema validation
- **Redis** — In-memory caching and sessions
- **Socket.IO** — Real-time bidirectional communication
- **JWT** — Stateless authentication
- **Rate Limiting** — API protection
- **Winston** — Structured logging

### DevOps & Infrastructure

- **Docker & Docker Compose** — Containerization
- **Kubernetes** — Orchestration ready
- **Prometheus + Grafana** — Monitoring stack
- **Loki** — Log aggregation
- **Trivy** — Vulnerability scanner
- **Helm** — Package management (optional)
- **Terraform** — Infrastructure as code (optional)

---

## 📁 Project Structure

```
kubeguardian-ai/
├── client/                           # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # UI components (Sidebar, TopNav, etc)
│   │   │   └── charts/             # Chart components (TrendChart)
│   │   ├── pages/                  # Route pages
│   │   │   ├── OverviewPage.tsx
│   │   │   ├── ClusterMonitoringPage.tsx
│   │   │   ├── VulnerabilitiesPage.tsx
│   │   │   ├── IncidentCenterPage.tsx
│   │   │   ├── AIAssistantPage.tsx
│   │   │   ├── ChaosEngineeringPage.tsx
│   │   │   ├── SecurityScoringPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts              # Axios API client
│   │   │   └── mockApi.ts          # Mock data for demo
│   │   ├── store/                  # Zustand state management
│   │   │   └── uiStore.ts
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── index.html                  # HTML template
│   ├── vite.config.ts              # Vite configuration
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── package.json
│   └── Dockerfile
│
├── server/                          # Express.js Backend
│   ├── src/
│   │   ├── controllers/            # Request handlers
│   │   ├── routes/                 # API endpoint definitions
│   │   │   ├── auth.ts            # Authentication routes
│   │   │   ├── clusters.ts        # Cluster management
│   │   │   ├── ai.ts              # AI analysis endpoints
│   │   │   ├── alerts.ts          # Alert management
│   │   │   ├── metrics.ts         # Metrics collection
│   │   │   ├── security.ts        # Security endpoints
│   │   │   ├── compliance.ts      # Compliance APIs
│   │   │   └── scans.ts           # Scanning endpoints
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Cluster.ts
│   │   │   ├── Alert.ts
│   │   │   └── Vulnerability.ts
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── services/               # Business logic
│   │   ├── utils/                  # Utilities
│   │   │   └── logger.ts
│   │   ├── config/                 # Configuration files
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   ├── kubernetes/             # Kubernetes client
│   │   └── index.ts                # Express app entry
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── infrastructure/
│   ├── kubernetes/                 # K8s manifests
│   │   ├── namespace.yaml
│   │   ├── client-deployment.yaml
│   │   ├── server-deployment.yaml
│   │   ├── mongodb-deployment.yaml
│   │   └── kustomization.yaml
│   ├── monitoring/                 # Prometheus & Grafana setup
│   │   ├── prometheus.yml
│   │   ├── grafana/
│   │   └── kubeguardian_rules.yml
│   └── terraform/                  # Infrastructure as Code
│
├── docs/                           # Documentation
├── package.json                    # Root workspace config
├── docker-compose.yml              # Local development
└── README.md                       # This file
```

---

## 🛠️ Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10 or **yarn** ≥ 3
- **Docker & Docker Compose** (for containerized development)
- **MongoDB** (local or Atlas)
- **Redis** (optional, for caching)

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd "KubeGuardian AI – Cloud Native DevSecOps Automation Platform"
npm install
```

### 2. Configure Environment

Create `.env` files for both client and server:

**client/.env.local:**
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

**server/.env:**
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/kubeguardian
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### 3. Development Mode

**Option A: Local Development (without Docker)**

Terminal 1 — Start Backend:
```bash
npm run dev:server
# Server runs on http://localhost:8000
```

Terminal 2 — Start Frontend:
```bash
npm run dev:client
# Client runs on http://localhost:3000
```

Terminal 3 (optional) — Start Monitoring:
```bash
docker-compose up prometheus grafana
```

**Option B: Docker Compose**

```bash
npm run docker:up
```

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/health
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

### 4. Build for Production

```bash
npm run build
```

---

## 📊 Key Features & Dashboard Pages

### Overview Dashboard
- Live cluster health metrics (CPU, RAM, Pod count)
- AI predictive alerts and anomaly detection
- Resource topology visualization
- Node status and pod distribution

### Cluster Monitoring
- Real-time node telemetry
- Namespace and deployment status
- Pod lifecycle tracking
- Resource utilization trends

### Vulnerabilities & Security
- CVE scanning results
- Risk scoring dashboard
- Affected service mapping
- Remediation recommendations

### Incident Center
- Active incident timeline
- Self-healing simulation logs
- Alert correlation analysis
- Recovery metrics

### AI Assistant
- Natural language Kubernetes commands
- Pod failure root cause analysis
- YAML generation and validation
- Deployment risk scoring

### Chaos Engineering
- Resilience testing scenarios
- Fault injection simulations
- Recovery speed metrics
- Impact analysis

### Security Scoring
- Cluster/namespace/deployment scores
- Compliance analysis (CIS benchmarks)
- Policy violation detection
- Security trend tracking

### Settings
- Theme preferences
- Integration configuration
- Alert notification channels
- Platform customization

---

## 🔐 Authentication & Authorization

The platform includes:

- **JWT-based Authentication** — Stateless, token-driven
- **Role-Based Access Control (RBAC)** — Admin, DevOps Engineer, Security Analyst, Viewer
- **Rate Limiting** — Protects APIs from abuse
- **Session Management** — Redis-backed user sessions

Example roles:
```typescript
enum UserRole {
  ADMIN = 'admin',
  DEVSECOPS_ENGINEER = 'devsecops_engineer',
  SECURITY_ANALYST = 'security_analyst',
  VIEWER = 'viewer'
}
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
- `POST /api/auth/refresh` — Refresh access token
- `GET /api/auth/me` — Get current user

### Clusters
- `GET /api/clusters` — List all clusters
- `GET /api/clusters/:id` — Get cluster details
- `POST /api/clusters/connect` — Connect a new cluster
- `PATCH /api/clusters/:id/status` — Update cluster status

### AI & Analysis
- `POST /api/ai/chat` — Chat with AI assistant
- `POST /api/ai/analyze-logs` — Analyze logs with AI
- `GET /api/ai/insights` — Get AI-driven insights
- `POST /api/ai/security-analysis` — Security risk analysis

### Vulnerabilities
- `GET /api/scans` — Fetch vulnerability scans
- `POST /api/scans/trivy` — Trigger Trivy scan
- `GET /api/scans/:id` — Get scan details

### Alerts & Metrics
- `GET /api/alerts` — List active alerts
- `POST /api/alerts` — Create new alert
- `GET /api/metrics/cluster/:id` — Get cluster metrics

---

## 🧪 Testing

### Run Tests
```bash
npm run test
npm run test:client
npm run test:server
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

---

## 📝 Environment Variables

### Client (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Server (.env)
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/kubeguardian
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-key (optional)
```

---

## 🐳 Docker Deployment

### Build Images
```bash
npm run docker:build
```

### Run Containers
```bash
npm run docker:up
```

### Stop Containers
```bash
npm run docker:down
```

---

## ☸️ Kubernetes Deployment

### Deploy to K8s Cluster
```bash
npm run k8s:deploy
```

### Delete K8s Resources
```bash
npm run k8s:delete
```

Manifests are located in `infrastructure/kubernetes/`.

---

## 📚 Documentation

For comprehensive documentation, see:

- **API Docs**: [Backend API Documentation](./docs/api.md)
- **Architecture**: [System Architecture](./docs/architecture.md)
- **Deployment**: [Deployment Guide](./docs/deployment.md)
- **Development**: [Development Guide](./docs/development.md)

---

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 🙌 Support & Community

- **Issues & Bugs**: Report on GitHub Issues
- **Discussions**: Join our GitHub Discussions
- **Security**: Report security vulnerabilities to security@example.com

---

## 🎯 Roadmap

- [ ] OpenAI ChatGPT Integration
- [ ] Advanced Chaos Engineering Scenarios
- [ ] Kubernetes Network Policies UI
- [ ] Real-time Multi-Cluster Federation
- [ ] Advanced ML-based Anomaly Detection
- [ ] CI/CD Pipeline Visualization
- [ ] Cost Optimization Analytics
- [ ] Advanced RBAC Management UI

---

**KubeGuardian AI** — Bringing intelligence to cloud-native operations. 🚀
