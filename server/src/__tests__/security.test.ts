import { scanContainerImage, scanManifestContent } from '../security/trivyScanner'
import { analyzeRbacSecurity } from '../security/rbacAnalyzer'
import { analyzeNetworkSecurity } from '../security/networkPolicyAnalyzer'
import { evaluateCisBenchmark } from '../security/cisBenchmark'

describe('Security Scanning, RBAC, Network Security & CIS Benchmark', () => {
  it('scans container images for CVE findings and CVSS scores', async () => {
    const result = await scanContainerImage('registry.k8s.local/payments:1.4.2')
    expect(result.status).toBe('completed')
    expect(result.vulnerabilitiesFound).toBeGreaterThan(0)
    expect(result.findings.some(f => f.cveId === 'CVE-2024-21626')).toBe(true)
  })

  it('scans Kubernetes manifests for security misconfigurations', async () => {
    const yamlContent = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: insecure-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: nginx:latest
        securityContext:
          privileged: true
    `
    const result = await scanManifestContent(yamlContent, 'insecure-app.yaml')
    expect(result.status).toBe('completed')
    expect(result.findings.some(f => f.cveId === 'K8S-PSS-001')).toBe(true)
  })

  it('analyzes RBAC bindings and computes an objective score', async () => {
    const report = await analyzeRbacSecurity()
    expect(typeof report.overallRbacScore).toBe('number')
    expect(report.overallRbacScore).toBeGreaterThanOrEqual(0)
    expect(report.overallRbacScore).toBeLessThanOrEqual(100)
    expect(report.findings.length).toBeGreaterThan(0)
  })

  it('audits network policy isolation and generates default-deny policies', async () => {
    const report = await analyzeNetworkSecurity()
    expect(typeof report.networkIsolationScore).toBe('number')
    expect(report.audits.length).toBeGreaterThan(0)
    expect(report.generatedPolicies.length).toBeGreaterThan(0)
  })

  it('evaluates CIS Kubernetes Benchmark sections and dynamic score', async () => {
    const report = await evaluateCisBenchmark()
    expect(report.benchmark).toContain('CIS Kubernetes Benchmark')
    expect(report.overallScore).toBeGreaterThanOrEqual(0)
    expect(report.overallScore).toBeLessThanOrEqual(100)
    expect(report.sections.length).toBe(4)
  })
})
