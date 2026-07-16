export const overviewData = {
  summary: [
    { label: 'Cluster Health', value: '92%', delta: '+4.2%' },
    { label: 'Active Pods', value: '128', delta: '+9' },
    { label: 'Open Alerts', value: '14', delta: '-6' },
    { label: 'Security Score', value: '84/100', delta: '+3' }
  ],
  cpuSeries: [
    { name: '00:00', value: 40 },
    { name: '03:00', value: 48 },
    { name: '06:00', value: 38 },
    { name: '09:00', value: 62 },
    { name: '12:00', value: 57 },
    { name: '15:00', value: 68 },
    { name: '18:00', value: 53 },
    { name: '21:00', value: 46 }
  ],
  memorySeries: [
    { name: '00:00', value: 56 },
    { name: '03:00', value: 60 },
    { name: '06:00', value: 54 },
    { name: '09:00', value: 72 },
    { name: '12:00', value: 65 },
    { name: '15:00', value: 74 },
    { name: '18:00', value: 67 },
    { name: '21:00', value: 58 }
  ],
  nodes: [
    { name: 'prod-node-01', status: 'Healthy', cpu: '68%', ram: '56%', pods: 26 },
    { name: 'prod-node-02', status: 'Healthy', cpu: '62%', ram: '49%', pods: 24 },
    { name: 'prod-node-03', status: 'Degraded', cpu: '81%', ram: '78%', pods: 30 }
  ]
}

export const clusterList = [
  { id: 'cluster-1', name: 'KubeGuardian Cluster', namespaces: 16, pods: 128, status: 'Healthy', restarts: 12 },
  { id: 'cluster-2', name: 'Edge Compute Cluster', namespaces: 11, pods: 84, status: 'Warning', restarts: 27 }
]

export const vulnerabilities = [
  { id: 'CVE-2025-1001', package: 'nginx', severity: 'Critical', status: 'Open', service: 'ingress-gateway', score: 9.8 },
  { id: 'CVE-2025-1012', package: 'openssl', severity: 'High', status: 'Open', service: 'auth-service', score: 8.7 },
  { id: 'CVE-2025-1025', package: 'node', severity: 'Medium', status: 'Remediated', service: 'billing-api', score: 6.2 }
]

export const incidents = [
  {
    id: 'INC-2105',
    title: 'Pod crashloop detected',
    affected: ['payments-service'],
    status: 'Investigating',
    startedAt: '2026-05-12T09:12:00Z',
    severity: 'High',
    summary: 'Multiple restarts observed for payments-service, likely memory exhaustion.'
  },
  {
    id: 'INC-2106',
    title: 'RBAC policy violation',
    affected: ['dev-ops'],
    status: 'Resolved',
    startedAt: '2026-05-11T16:30:00Z',
    severity: 'Medium',
    summary: 'Unauthorized service account attempt blocked in namespace dev-ops.'
  }
]

export const aiMessages = [
  {
    role: 'assistant' as const,
    content: 'Welcome to the AI troubleshooting assistant. Ask about pod failures, deployment risks, or generate kubectl commands.',
    timestamp: new Date().toISOString()
  }
]

export const chaosScenarios = [
  { id: 'CHAOS-01', name: 'Pod deletion test', status: 'Ready', objective: 'Validate self-healing for payment-service.', impact: 'Low' },
  { id: 'CHAOS-02', name: 'CPU spike injection', status: 'Active', objective: 'Measure resilience of edge compute cluster.', impact: 'Medium' }
]

export const securityScores = {
  cluster: 84,
  namespace: 79,
  deployment: 88,
  trends: [
    { name: 'Mon', score: 81 },
    { name: 'Tue', score: 83 },
    { name: 'Wed', score: 85 },
    { name: 'Thu', score: 87 },
    { name: 'Fri', score: 84 }
  ]
}

export const commandExamples = [
  { intent: 'restart payment-service', command: 'kubectl rollout restart deployment payment-service' },
  { intent: 'scale api to 5 replicas', command: 'kubectl scale deployment api --replicas=5' },
  { intent: 'delete misbehaving pod', command: 'kubectl delete pod payment-service-abc123' }
]
