import { Cluster, ICluster } from '@/models/Cluster'
import { Alert, IAlert } from '@/models/Alert'
import { Vulnerability, IVulnerability } from '@/models/Vulnerability'
import { Remediation, IRemediation } from '@/models/Remediation'
import { Settings, ISettings } from '@/models/Settings'
import { AuditLog, IAuditLog } from '@/models/AuditLog'
import mongoose from 'mongoose'
import { logger } from '@/utils/logger'

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1
}

// In-Memory Fallback Store (active when MongoDB is not connected)
class MemoryDataStore {
  clusters: any[] = []
  alerts: any[] = []
  vulnerabilities: any[] = []
  remediations: any[] = []
  settings: any = null
  auditLogs: any[] = []
  scans: any[] = []

  constructor() {
    this.seedDefaultData()
  }

  seedDefaultData() {
    this.clusters = [
      {
        _id: 'cl-live-01',
        name: 'KubeGuardian Primary Cluster',
        endpoint: 'https://kubernetes.default.svc.cluster.local:443',
        version: 'v1.28.4',
        status: 'healthy',
        nodeCount: 3,
        namespaceCount: 6,
        podCount: 28,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'cl-edge-02',
        name: 'Edge Compute Cluster',
        endpoint: 'https://edge-k8s.internal:6443',
        version: 'v1.27.8',
        status: 'unhealthy',
        nodeCount: 2,
        namespaceCount: 4,
        podCount: 14,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    this.alerts = [
      {
        _id: 'alt-001',
        title: 'Pod CrashLoopBackOff: payment-service',
        description: 'Pod payment-service-7d8b5c984-xq29m in namespace production has restarted 14 times with exit code 137 (OOMKilled). Memory limit is 256Mi, usage exceeded 260Mi.',
        severity: 'critical',
        status: 'active',
        clusterId: 'cl-live-01',
        namespace: 'production',
        source: 'kubelet',
        labels: { app: 'payment-service', tier: 'backend', incident: 'INC-2105' },
        createdAt: new Date(Date.now() - 25 * 60 * 1000)
      },
      {
        _id: 'alt-002',
        title: 'Overly Permissive RBAC Binding Detected',
        description: 'ClusterRoleBinding cluster-admin-default binds default ServiceAccount in dev-ops namespace to cluster-admin role. Violates least privilege policy.',
        severity: 'high',
        status: 'active',
        clusterId: 'cl-live-01',
        namespace: 'dev-ops',
        source: 'kubeguardian-rbac-auditor',
        labels: { rule: 'CIS-Kubernetes-5.1.1', severity: 'High', incident: 'INC-2106' },
        createdAt: new Date(Date.now() - 90 * 60 * 1000)
      },
      {
        _id: 'alt-003',
        title: 'Missing Default Deny NetworkPolicy',
        description: 'Namespace frontend lacks ingress isolation NetworkPolicy. Pods can receive unrestricted ingress traffic from any namespace in the cluster.',
        severity: 'medium',
        status: 'active',
        clusterId: 'cl-live-01',
        namespace: 'frontend',
        source: 'kubeguardian-netsec',
        labels: { rule: 'CIS-Kubernetes-5.3.2' },
        createdAt: new Date(Date.now() - 180 * 60 * 1000)
      },
      {
        _id: 'alt-004',
        title: 'Privileged Container Security Context Detected',
        description: 'Container fluent-bit in namespace logging is configured with privileged: true, granting root capabilities to the underlying host.',
        severity: 'high',
        status: 'acknowledged',
        clusterId: 'cl-live-01',
        namespace: 'logging',
        source: 'trivy-k8s',
        labels: { rule: 'PSS-Baseline-Privileged' },
        createdAt: new Date(Date.now() - 360 * 60 * 1000)
      }
    ]

    this.vulnerabilities = [
      {
        _id: 'vuln-001',
        cveId: 'CVE-2024-21626',
        title: 'runc Container Breakout via File Descriptor Leak',
        description: 'Internal file descriptor leaks in runc allow an attacker to escape container boundaries and write to the host filesystem.',
        severity: 'critical',
        cvssScore: 9.8,
        package: 'runc',
        version: '1.1.11',
        fixedVersion: '1.1.12',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-21626'],
        clusterId: 'cl-live-01',
        namespace: 'production',
        pod: 'payment-service-7d8b5c984-xq29m',
        container: 'payment-service',
        image: 'registry.k8s.local/payments:1.4.2',
        status: 'active',
        discoveredAt: new Date(Date.now() - 48 * 3600 * 1000)
      },
      {
        _id: 'vuln-002',
        cveId: 'CVE-2023-44487',
        title: 'HTTP/2 Rapid Reset Denial of Service',
        description: 'Rapid stream reset attack vectors cause high resource utilization on ingress and HTTP/2 proxy endpoints.',
        severity: 'high',
        cvssScore: 8.5,
        package: 'nghttp2',
        version: '1.43.0',
        fixedVersion: '1.57.0',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-44487'],
        clusterId: 'cl-live-01',
        namespace: 'ingress-nginx',
        pod: 'ingress-nginx-controller-6b4594c7-w84pk',
        container: 'controller',
        image: 'k8s.gcr.io/ingress-nginx/controller:v1.8.0',
        status: 'active',
        discoveredAt: new Date(Date.now() - 72 * 3600 * 1000)
      },
      {
        _id: 'vuln-003',
        cveId: 'CVE-2023-38545',
        title: 'curl SOCKS5 Heap Buffer Overflow',
        description: 'Heap buffer overflow vulnerability in SOCKS5 hostname handshake in libcurl.',
        severity: 'high',
        cvssScore: 8.2,
        package: 'curl',
        version: '7.88.1',
        fixedVersion: '8.4.0',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-38545'],
        clusterId: 'cl-live-01',
        namespace: 'production',
        pod: 'auth-service-589fc48d9f-z7vkm',
        container: 'auth-service',
        image: 'registry.k8s.local/auth:2.1.0',
        status: 'active',
        discoveredAt: new Date(Date.now() - 96 * 3600 * 1000)
      },
      {
        _id: 'vuln-004',
        cveId: 'CVE-2023-48795',
        title: 'SSH Protocol Extension Negotiation Flaw (Terrapin Attack)',
        description: 'Prefix truncation attack in SSH transport protocol allowing attackers to downgrade connection security.',
        severity: 'medium',
        cvssScore: 5.9,
        package: 'openssh',
        version: '9.3p1',
        fixedVersion: '9.6p1',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-48795'],
        clusterId: 'cl-live-01',
        namespace: 'dev-ops',
        pod: 'bastion-host-7848c7bc7-qplmx',
        container: 'ssh-tunnel',
        image: 'alpine/openssh:9.3',
        status: 'active',
        discoveredAt: new Date(Date.now() - 120 * 3600 * 1000)
      },
      {
        _id: 'vuln-005',
        cveId: 'CVE-2022-42889',
        title: 'Apache Commons Text Remote Code Execution (Text4Shell)',
        description: 'Variable interpolation vulnerability leading to arbitrary script execution in Java applications.',
        severity: 'critical',
        cvssScore: 9.8,
        package: 'org.apache.commons:commons-text',
        version: '1.9',
        fixedVersion: '1.10.0',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-42889'],
        clusterId: 'cl-live-01',
        namespace: 'production',
        pod: 'billing-api-6f7d544cb-kkx2m',
        container: 'billing-api',
        image: 'registry.k8s.local/billing:1.2.0',
        status: 'resolved',
        resolvedAt: new Date(Date.now() - 24 * 3600 * 1000),
        discoveredAt: new Date(Date.now() - 140 * 3600 * 1000)
      }
    ]

    this.remediations = [
      {
        _id: 'rem-001',
        remediationId: 'REM-2026-001',
        title: 'Patch Memory Limit & Restart OOMKilled payment-service',
        description: 'Increase memory limit from 256Mi to 512Mi to eliminate OOMKilled crashloop, then safely trigger rolling restart of deployment.',
        targetNamespace: 'production',
        targetResource: 'payment-service',
        targetKind: 'Deployment',
        action: 'patch_resource_limits',
        riskLevel: 'medium',
        status: 'pending_approval',
        dryRunDiff: `--- spec.template.spec.containers[0].resources.limits.memory
+++ spec.template.spec.containers[0].resources.limits.memory
- 256Mi
+ 512Mi`,
        rollbackPlan: 'kubectl set resources deployment payment-service -n production --limits=memory=256Mi',
        requestedBy: 'KubeGuardian AI Engine',
        alertId: 'alt-001',
        createdAt: new Date(Date.now() - 20 * 60 * 1000)
      },
      {
        _id: 'rem-002',
        remediationId: 'REM-2026-002',
        title: 'Revoke cluster-admin Binding for Default ServiceAccount',
        description: 'Remove high-risk ClusterRoleBinding cluster-admin-default in dev-ops namespace and bind least-privilege view-only Role instead.',
        targetNamespace: 'dev-ops',
        targetResource: 'cluster-admin-default',
        targetKind: 'RoleBinding',
        action: 'apply_network_policy',
        riskLevel: 'high',
        status: 'pending_approval',
        dryRunDiff: `--- ClusterRoleBinding/cluster-admin-default
+++ RoleBinding/dev-ops-viewer
- roleRef: cluster-admin (ClusterRole)
+ roleRef: view (Role in dev-ops namespace)`,
        rollbackPlan: 'kubectl create clusterrolebinding cluster-admin-default --clusterrole=cluster-admin --serviceaccount=dev-ops:default',
        requestedBy: 'KubeGuardian RBAC Auditor',
        alertId: 'alt-002',
        createdAt: new Date(Date.now() - 40 * 60 * 1000)
      },
      {
        _id: 'rem-003',
        remediationId: 'REM-2026-003',
        title: 'Apply Default-Deny Ingress NetworkPolicy to frontend Namespace',
        description: 'Enforce Kubernetes NetworkPolicy restricting ingress traffic to authorized ingress controllers and inter-namespace mTLS services.',
        targetNamespace: 'frontend',
        targetResource: 'default-deny-ingress',
        targetKind: 'NetworkPolicy',
        action: 'apply_network_policy',
        riskLevel: 'low',
        status: 'executed',
        dryRunDiff: `+ apiVersion: networking.k8s.io/v1
+ kind: NetworkPolicy
+ metadata:
+   name: default-deny-ingress
+   namespace: frontend
+ spec:
+   podSelector: {}
+   policyTypes:
+   - Ingress`,
        rollbackPlan: 'kubectl delete networkpolicy default-deny-ingress -n frontend',
        requestedBy: 'KubeGuardian CIS Engine',
        approvedBy: 'admin@kubeguardian.local',
        executedAt: new Date(Date.now() - 100 * 60 * 1000),
        executionResult: 'Successfully applied NetworkPolicy default-deny-ingress in namespace frontend',
        alertId: 'alt-003',
        createdAt: new Date(Date.now() - 120 * 60 * 1000)
      }
    ]

    this.settings = {
      general: {
        clusterName: 'KubeGuardian AI Platform',
        adminEmail: 'admin@kubeguardian.local',
        timezone: 'UTC',
        language: 'English',
        autoRefreshInterval: 15
      },
      notifications: {
        channels: {
          email: { enabled: true, address: 'devsecops-alerts@kubeguardian.local' },
          slack: { enabled: true, webhook: 'https://hooks.slack.com/services/T00/B00/X00' },
          discord: { enabled: false, webhook: '' },
          telegram: { enabled: false, botToken: '', chatId: '' }
        }
      },
      security: {
        enableRBAC: true,
        requireMFA: true,
        sessionTimeout: 3600,
        passwordMinLength: 12,
        enableAuditLogs: true
      },
      integrations: {
        prometheus: { name: 'Prometheus', enabled: true, status: 'connected' },
        grafana: { name: 'Grafana', enabled: true, status: 'connected' },
        trivy: { name: 'Trivy Scanner', enabled: true, status: 'connected' },
        falco: { name: 'Falco Runtime', enabled: true, status: 'connected' }
      }
    }

    this.auditLogs = [
      {
        _id: 'aud-001',
        action: 'REMEDIATION_EXECUTION',
        category: 'remediation',
        actor: 'admin@kubeguardian.local',
        target: 'NetworkPolicy/default-deny-ingress',
        details: { namespace: 'frontend', remediationId: 'REM-2026-003' },
        status: 'success',
        createdAt: new Date(Date.now() - 100 * 60 * 1000)
      },
      {
        _id: 'aud-002',
        action: 'TRIVY_VULNERABILITY_SCAN',
        category: 'security',
        actor: 'system',
        target: 'production/payment-service',
        details: { image: 'registry.k8s.local/payments:1.4.2', criticalVulnsFound: 1 },
        status: 'warning',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000)
      }
    ]

    this.scans = [
      {
        id: 'scan-001',
        type: 'image',
        target: 'registry.k8s.local/payments:1.4.2',
        clusterId: 'cl-live-01',
        status: 'completed',
        startedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
        vulnerabilitiesFound: 3,
        findings: [
          { cve: 'CVE-2024-21626', severity: 'critical', package: 'runc' },
          { cve: 'CVE-2023-38545', severity: 'high', package: 'curl' }
        ]
      },
      {
        id: 'scan-002',
        type: 'manifest',
        target: 'k8s/sample-app.yaml',
        clusterId: 'cl-live-01',
        status: 'completed',
        startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
        vulnerabilitiesFound: 2,
        findings: [
          { cve: 'SEC-001', severity: 'high', title: 'Container running without readOnlyRootFilesystem' },
          { cve: 'SEC-002', severity: 'medium', title: 'Missing memory and CPU resource limits' }
        ]
      }
    ]
  }
}

export const memoryStore = new MemoryDataStore()
