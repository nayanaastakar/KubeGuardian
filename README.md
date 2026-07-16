# KubeGuardian AI – Cloud Native DevSecOps Automation Platform
Pull request update
> 🚀 **AI-powered Kubernetes security and DevSecOps automation platform**

KubeGuardian AI is an enterprise-grade Cloud Native DevSecOps Automation Platform that combines Kubernetes security, AI-powered threat analysis, CI/CD automation, monitoring, compliance auditing, and auto-remediation into one intelligent platform.

## 🌟 Key Features

- **🔒svix  Kubernetes Security Scanning** - Automated vulnerability detection with Trivy, Falco, and OPA
- **🤖 AI-Powered Analysis** - Intelligent log analysis, threat prioritization, and remediation suggestions
- **📊 Real-time Monitoring** - Prometheus + Grafana dashboards for cluster health and security metrics
- **🔄 CI/CD Automation** - GitHub Actions integration with security gates and auto-remediation
- **📈 Compliance & Auditing** - CIS benchmarks, OWASP compliance, and automated reporting
- **⚡ Auto-Remediation** - AI-driven fixes for common security issues and misconfigurations
- **💰 Cost Optimization** - Resource usage analysis and cost recommendations
- **🎯 Multi-Cluster Management** - Unified dashboard for managing multiple Kubernetes clusters

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Service    │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│  (FastAPI)      │
│   TypeScript    │    │   Express       │    │   Python        │
│   Tailwind      │    │   JWT Auth      │    │   OpenAI        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   Kubernetes    │
│   Database      │    │     Cache       │    │   Cluster       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Modern component library
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **JWT** - Authentication
- **RBAC** - Role-based access control
- **WebSockets** - Real-time updates

### AI Service
- **Python FastAPI** - High-performance API
- **OpenAI API** - AI capabilities
- **LangChain** - LLM orchestration
- **RAG** - Retrieval-augmented generation

### Database & Cache
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions

### DevOps & Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **Helm** - Package management
- **Terraform** - Infrastructure as code
- **GitHub Actions** - CI/CD pipelines

### Monitoring & Observability
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **Loki** - Log aggregation
- **Fluent Bit** - Log forwarding

### Security Tools
- **Trivy** - Vulnerability scanning
- **Falco** - Runtime security
- **OPA Gatekeeper** - Policy enforcement
- **kube-bench** - CIS compliance
- **kube-hunter** - Penetration testing

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.9+
- kubectl
- Minikube or Kind (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourorg/kubeguardian-ai.git
   cd kubeguardian-ai
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   npm run docker:up
   ```

4. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - AI Service: http://localhost:8001
   - Grafana: http://localhost:3001 (admin/admin)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development servers**
   ```bash
   npm run dev
   ```

3. **Run AI service separately**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

## 📁 Project Structure

```
kubeguardian-ai/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   ├── pages/               # Legacy pages
│   ├── hooks/               # Custom React hooks
│   ├── store/               # State management
│   └── services/            # API services
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── utils/           # Utility functions
│   │   └── kubernetes/      # K8s integration
├── ai-service/              # Python FastAPI AI service
│   ├── app/                 # FastAPI app
│   ├── rag/                 # RAG implementation
│   ├── models/              # AI models
│   └── prompts/             # AI prompts
├── infrastructure/          # DevOps configurations
│   ├── kubernetes/          # K8s manifests
│   ├── helm/               # Helm charts
│   ├── terraform/          # Terraform configs
│   └── monitoring/         # Monitoring setup
├── github-actions/          # CI/CD workflows
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://kubeguardian:password@localhost:5432/kubeguardian
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI Service
OPENAI_API_KEY=your-openai-api-key
AI_SERVICE_URL=http://localhost:8001

# Kubernetes
KUBECONFIG_PATH=/path/to/your/kubeconfig

# Monitoring
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3001

# External Services
SLACK_WEBHOOK_URL=your-slack-webhook
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
```

## 🚢 Deployment

### Kubernetes Deployment

1. **Build Docker images**
   ```bash
   npm run docker:build
   ```

2. **Deploy to Kubernetes**
   ```bash
   npm run k8s:deploy
   ```

### Helm Deployment

```bash
helm install kubeguardian-ai ./infrastructure/helm/kubeguardian-ai
```

### Terraform Infrastructure

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

## 📊 Monitoring & Observability

### Grafana Dashboards

- **Cluster Overview** - Overall cluster health and metrics
- **Security Dashboard** - Vulnerability trends and security events
- **DevOps Dashboard** - CI/CD pipeline status and deployment metrics
- **Cost Dashboard** - Resource usage and cost optimization

### Prometheus Metrics

Key metrics available:
- `kubeguardian_cluster_nodes_total`
- `kubeguardian_vulnerabilities_found`
- `kubeguardian_security_score`
- `kubeguardian_deployment_success_rate`
- `kubeguardian_ai_requests_total`

## 🔒 Security Features

### Vulnerability Scanning

- **Container Image Scanning** - Trivy integration for CVE detection
- **Kubernetes Manifest Scanning** - Configuration security checks
- **Runtime Security** - Falco for threat detection
- **Compliance Checking** - CIS benchmarks and OPA policies

### AI-Powered Security

- **Threat Prioritization** - AI ranks vulnerabilities by risk
- **Auto-Remediation** - Automatic fixes for common issues
- **Log Analysis** - AI summarizes and analyzes security logs
- **Security Assistant** - Chatbot for security guidance

## 🤖 AI Features

### AI Security Assistant

Ask questions like:
- "Why did my deployment fail?"
- "How do I fix this CVE vulnerability?"
- "Analyze these pod logs for security issues"
- "Generate a secure Kubernetes deployment"

### AI Capabilities

- **Log Summarization** - Condense complex logs into insights
- **YAML Generation** - Create secure Kubernetes manifests
- **Threat Explanation** - Understand security implications
- **Remediation Suggestions** - Get actionable fix recommendations

## 📈 API Documentation

### Authentication

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

### Cluster Management

```http
GET /api/clusters
POST /api/clusters/connect
DELETE /api/clusters/:id
GET /api/clusters/:id/namespaces
```

### Security Scanning

```http
POST /api/scan/image
POST /api/scan/kubernetes
GET /api/scan/results
GET /api/vulnerabilities
```

### AI Services

```http
POST /api/ai/chat
POST /api/ai/analyze-logs
POST /api/ai/generate-yaml
POST /api/ai/remediate
```

## 🧪 Testing

### Unit Tests

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && npm test

# AI Service
cd ai-service && pytest
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/yourorg/kubeguardian-ai/issues)
- 💬 [Discord Community](https://discord.gg/kubeguardian)
- 📧 [Email Support](mailto:support@kubeguardian.ai)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourorg/kubeguardian-ai&type=Date)](https://star-history.com/#yourorg/kubeguardian-ai&Date)

---

**Built with ❤️ by the KubeGuardian AI Team**
