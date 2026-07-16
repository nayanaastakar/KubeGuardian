// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  ADMIN = 'admin',
  DEVOPS_ENGINEER = 'devops_engineer',
  SECURITY_ANALYST = 'security_analyst',
  VIEWER = 'viewer'
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Kubernetes Types
export interface Cluster {
  id: string
  name: string
  endpoint: string
  version: string
  status: ClusterStatus
  nodeCount: number
  namespaceCount: number
  podCount: number
  createdAt: string
  updatedAt: string
}

export enum ClusterStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected'
}

export interface Namespace {
  name: string
  status: string
  createdAt: string
  labels: Record<string, string>
}

export interface Pod {
  name: string
  namespace: string
  status: string
  phase: PodPhase
  nodeName: string
  podIP: string
  createdAt: string
  restartCount: number
  containers: Container[]
}

export enum PodPhase {
  PENDING = 'Pending',
  RUNNING = 'Running',
  SUCCEEDED = 'Succeeded',
  FAILED = 'Failed',
  UNKNOWN = 'Unknown'
}

export interface Container {
  name: string
  image: string
  status: string
  ready: boolean
  restartCount: number
  resources?: ContainerResources
}

export interface ContainerResources {
  requests: {
    cpu: string
    memory: string
  }
  limits: {
    cpu: string
    memory: string
  }
}

// Security and Vulnerability Types
export interface Vulnerability {
  id: string
  title: string
  description: string
  severity: VulnerabilitySeverity
  cvssScore?: number
  cveId?: string
  package?: string
  version?: string
  fixedVersion?: string
  references: string[]
  discoveredAt: string
  clusterId?: string
  namespace?: string
  pod?: string
  container?: string
  image?: string
}

export enum VulnerabilitySeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export interface SecurityScan {
  id: string
  type: ScanType
  status: ScanStatus
  clusterId?: string
  namespace?: string
  image?: string
  startedAt: string
  completedAt?: string
  vulnerabilitiesFound: number
  vulnerabilities: Vulnerability[]
  config?: ScanConfig
}

export enum ScanType {
  IMAGE = 'image',
  KUBERNETES = 'kubernetes',
  RUNTIME = 'runtime'
}

export enum ScanStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ScanConfig {
  scanSecrets: boolean
  scanMisconfigurations: boolean
  scanDependencies: boolean
  excludePaths?: string[]
}

// Monitoring and Metrics Types
export interface Metric {
  name: string
  value: number
  timestamp: string
  labels: Record<string, string>
}

export interface ClusterMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkIO: {
    bytesIn: number
    bytesOut: number
  }
  podCount: number
  runningPods: number
  failedPods: number
}

export interface Alert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  clusterId?: string
  namespace?: string
  source: string
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  labels: Record<string, string>
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved'
}

// AI and Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface AIAnalysis {
  id: string
  type: AnalysisType
  input: string
  output: string
  confidence: number
  timestamp: string
  userId: string
  clusterId?: string
}

export enum AnalysisType {
  LOG_ANALYSIS = 'log_analysis',
  VULNERABILITY_ANALYSIS = 'vulnerability_analysis',
  REMEDIATION_SUGGESTION = 'remediation_suggestion',
  THREAT_EXPLANATION = 'threat_explanation',
  YAML_GENERATION = 'yaml_generation'
}

// CI/CD Types
export interface Pipeline {
  id: string
  name: string
  repository: string
  branch: string
  status: PipelineStatus
  triggeredBy: string
  startedAt: string
  completedAt?: string
  duration?: number
  stages: PipelineStage[]
  securityScan?: SecurityScan
}

export enum PipelineStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface PipelineStage {
  name: string
  status: PipelineStatus
  startedAt: string
  completedAt?: string
  duration?: number
  logs?: string
}

// Compliance and Audit Types
export interface ComplianceReport {
  id: string
  type: ComplianceType
  clusterId: string
  status: ComplianceStatus
  score: number
  totalChecks: number
  passedChecks: number
  failedChecks: number
  generatedAt: string
  checks: ComplianceCheck[]
}

export enum ComplianceType {
  CIS_BENCHMARK = 'cis_benchmark',
  OWASP = 'owasp',
  NIST = 'nist',
  CUSTOM = 'custom'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant'
}

export interface ComplianceCheck {
  id: string
  title: string
  description: string
  severity: VulnerabilitySeverity
  status: 'pass' | 'fail' | 'warn'
  rationale: string
  remediation: string
  references: string[]
}

// Dashboard and UI Types
export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  size: WidgetSize
  position: { x: number; y: number }
  config: Record<string, any>
  data?: any
}

export enum WidgetType {
  METRIC_CHART = 'metric_chart',
  VULNERABILITY_SUMMARY = 'vulnerability_summary',
  CLUSTER_STATUS = 'cluster_status',
  ALERT_FEED = 'alert_feed',
  LOG_VIEWER = 'log_viewer',
  RESOURCE_USAGE = 'resource_usage'
}

export enum WidgetSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  WIDE = 'wide'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// WebSocket Types
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: string
}

export interface RealTimeUpdate {
  type: 'cluster_update' | 'vulnerability' | 'alert' | 'metric'
  data: any
  clusterId?: string
}

// Configuration Types
export interface AppConfig {
  apiBaseUrl: string
  wsUrl: string
  refreshInterval: number
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  slack: boolean
  desktop: boolean
  alerts: boolean
  vulnerabilities: boolean
  deployments: boolean
}
