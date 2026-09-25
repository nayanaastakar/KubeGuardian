# KubeGuardian AI - Cloud Native DevSecOps Automation Platform

**Academic Project Implementation - M.Tech Software Engineering (6-Credit)**

## 1. Project Title
KubeGuardian AI - An AI-Assisted Kubernetes DevSecOps Monitoring and Auto-Remediation Platform.

## 2. Problem Statement
Managing Kubernetes clusters involves complex troubleshooting, continuous security monitoring, and rapid incident response. Traditional tools often provide overwhelming telemetry data without actionable insights, requiring deep domain expertise to interpret logs, identify security risks, and execute remediation strategies safely.

## 3. Motivation
To bridge the gap between raw cluster telemetry and actionable DevSecOps operations by leveraging Large Language Models (LLMs) to synthesize alerts, analyze logs, and recommend controlled auto-remediation steps.

## 4. Objectives
*   Develop a secure, real-time interface for Kubernetes cluster monitoring.
*   Integrate LLM-assisted root-cause analysis for cluster incidents and security vulnerabilities.
*   Implement a controlled auto-remediation workflow to automatically resolve common pod failures.
*   Maintain a robust, testable, and demonstrable full-stack architecture.

## 5. Proposed Solution
KubeGuardian AI provides a centralized dashboard (MERN/React) that interfaces directly with a target Kubernetes cluster via the Kubernetes API. It securely streams live telemetry, uses OpenAI to contextualize errors and generate fixes, and provides a one-click auto-remediation pipeline.

## 6. Architecture
See `ARCHITECTURE.md` (or the architecture diagram provided) for a complete overview. The system consists of:
*   **Frontend**: React (Vite), Zustand, Tailwind CSS, Recharts.
*   **Backend**: Node.js, Express, Mongoose, `@kubernetes/client-node`, `openai`.
*   **Integrations**: Kubernetes API (Live), OpenAI API (Live), MongoDB (Persistent).

## 7. Technology Stack
*   **Frontend**: React, Vite, TypeScript, Tailwind
*   **Backend**: Node.js, Express, TypeScript
*   **Database**: MongoDB (Storage for clusters, incidents)
*   **DevOps/Infra**: Kubernetes, Docker, GitHub Actions (CI/CD pipelines with Trivy scanning)
*   **AI**: OpenAI API (`gpt-3.5-turbo`)

## 8. Core Features
*   **Live Kubernetes Telemetry**: Directly queries the cluster for namespaces, deployments, and pods, calculating restart metrics and health status.
*   **AI-Powered Log Analysis**: Feeds application/pod logs directly into OpenAI for structured JSON root-cause analysis and remediation generation.
*   **Controlled Auto-Remediation**: Allows authenticated users to safely restart failing workloads (e.g., deleting a pod to allow ReplicaSets to recreate it) directly from the dashboard.
*   **CI/CD Pipeline Integration**: The `.github` workflows demonstrate real-world CI/CD maturity using automated Trivy security scans on every build.

## 9. Implementation Status (Academic Audit)

### Implemented & Working
*   Live Kubernetes integration (`@kubernetes/client-node`) fetching real cluster stats.
*   Auto-Remediation (Pod deletion/restart) via the K8s API.
*   AI Assistant Chat and Log Analysis integrated directly with the OpenAI API.
*   Frontend UI fully responsive and connected to the backend API.
*   CI/CD pipelines (GitHub Actions) with automated container builds and Trivy vulnerability scanning.

### Partially Implemented / Mocked
*   *Security Scoring / Vulnerability Dashboard*: The UI is built, but currently displays static mock data instead of live Falco/Trivy outputs in the dashboard (Trivy *is* used in CI/CD, but results aren't pulled into the DB).
*   *Prometheus/Grafana*: Configurations exist in `infrastructure/`, but the frontend charts currently utilize deterministic mock trends rather than real PromQL queries to reduce system dependency overhead for the demo.

### Planned / Deliberately Omitted
*   *Custom Python ML Anomaly Detection*: Omitted to focus on the reliability of the core API and LLM integration. Training a custom model would add complexity without significantly improving the DevSecOps workflow demonstrated by the LLM.
*   *Multi-Cluster Auth*: Omitted to ensure the local demo runs reliably on a single `kubeconfig` (e.g., Minikube/Kind).

## 10. Running the Project

### Prerequisites
*   Node.js 18+
*   Docker & Docker Compose
*   A running Kubernetes cluster (e.g., Docker Desktop K8s, Minikube, or Kind).
*   An OpenAI API Key.

### Setup Instructions
1.  **Configure Environment**:
    Navigate to `server/` and edit or create `.env`:
    ```env
    NODE_ENV=development
    OPENAI_API_KEY=your_real_openai_key_here
    ```

2.  **Start Services**:
    From the root directory, run:
    ```bash
    npm install
    npm run dev
    ```
    This will use `concurrently` to launch both the React Vite client (port 3000) and the Node.js Express server (port 8000).

3.  **Access the Platform**:
    Open `http://localhost:3000` in your browser.

## 11. Example Demonstration Scenarios

**Scenario 1: Live Cluster Detection**
*   *Action*: Ensure a local Minikube/Docker K8s cluster is running. Start the app. Navigate to "Cluster Monitoring".
*   *Result*: The dashboard successfully authenticates via `~/.kube/config`, showing real pod counts and namespace data.

**Scenario 2: AI Troubleshooting**
*   *Action*: Navigate to "AI Assistant". Ask: "My payment-service pod is in CrashLoopBackOff with exit code 137. What does this mean?"
*   *Result*: The backend queries OpenAI, correctly identifying an OOM (Out of Memory) kill, and suggests increasing memory limits.

**Scenario 3: Controlled Remediation**
*   *Action*: Navigate to "Incident Center". Expand an open incident and click "Restart".
*   *Result*: The backend issues a `delete` command to the K8s API. You can run `kubectl get pods` in your terminal to witness Kubernetes automatically terminating and recreating the pod.
