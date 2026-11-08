import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

// Cluster Telemetry & Discovery
export const getHealth = () => api.get('/health')
export const getLiveClusterStats = () => api.get('/clusters/live')
export const getClusterPods = (namespace?: string) => api.get('/clusters/pods', { params: { namespace } })
export const getClusterNodes = () => api.get('/clusters/nodes')
export const getClusterNamespaces = () => api.get('/clusters/namespaces')
export const remediatePod = (namespace: string, podName: string) => api.post(`/clusters/remediate/pod/${namespace}/${podName}`)

// Metrics & Real-time Trends
export const getMetricsSummary = () => api.get('/metrics/summary')
export const getClusterMetrics = (id: string) => api.get(`/metrics/cluster/${id}`)

// Security & Vulnerability Scanning
export const getSecurityOverview = () => api.get('/security/overview')
export const getVulnerabilities = (params?: { severity?: string; status?: string; search?: string; page?: number; limit?: number }) => 
  api.get('/security/vulnerabilities', { params })
export const updateVulnerabilityStatus = (id: string, status: string) => 
  api.patch(`/security/vulnerabilities/${id}/status`, { status })
export const getScans = () => api.get('/scans')
export const startSecurityScan = (data: { type: 'image' | 'manifest'; target: string; manifestContent?: string }) => 
  api.post('/scans/start', data)

// RBAC & Network Security Audits
export const getRbacAnalysis = () => api.get('/rbac/analysis')
export const getNetworkSecurityAnalysis = () => api.get('/network/analysis')

// Compliance & Benchmarks
export const getComplianceOverview = () => api.get('/compliance/overview')
export const getCisBenchmark = () => api.get('/compliance/cis-benchmark')
export const getOwaspReport = () => api.get('/compliance/owasp')

// Alerts & Incidents
export const getAlerts = (params?: { severity?: string; status?: string; namespace?: string; search?: string }) => 
  api.get('/alerts', { params })
export const acknowledgeAlert = (id: string) => api.post(`/alerts/${id}/acknowledge`)
export const resolveAlert = (id: string) => api.post(`/alerts/${id}/resolve`)

// Approval-based Remediation Engine
export const getRemediations = (status?: string) => api.get('/remediation', { params: { status } })
export const proposeRemediation = (data: any) => api.post('/remediation/propose', data)
export const approveRemediation = (id: string, approvedBy?: string) => api.post(`/remediation/${id}/approve`, { approvedBy })
export const rejectRemediation = (id: string, reason?: string) => api.post(`/remediation/${id}/reject`, { reason })
export const executeRemediation = (id: string) => api.post(`/remediation/${id}/execute`)
export const rollbackRemediation = (id: string) => api.post(`/remediation/${id}/rollback`)

// AI DevSecOps Diagnostics & Assistant
export const chatWithAI = (message: string, context?: any) => api.post('/ai/chat', { message, context })
export const analyzeLogsWithAI = (logs: string, type?: string, clusterId?: string) => 
  api.post('/ai/analyze-logs', { logs, type, clusterId })

// Workload Resource Optimization
export const getResourceOptimization = () => api.get('/optimization')

// Platform Settings
export const getPlatformSettings = () => api.get('/settings')
export const updatePlatformSettings = (settings: any) => api.post('/settings', settings)
