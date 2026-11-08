import { checkDatabaseHealth } from '../config/database'
import { getClusterInfo, getPods, safeRestartPod } from '../kubernetes/client'
import { optimizeClusterResources } from '../services/resourceOptimizer'

describe('Cluster Telemetry, Database Health & Resource Optimization', () => {
  it('reports database health without crashing when in-memory engine is active', async () => {
    const health = await checkDatabaseHealth()
    expect(health.status).toBeDefined()
    expect(health.timestamp).toBeDefined()
  })

  it('retrieves cluster topology and pod inventory', async () => {
    const cluster = await getClusterInfo()
    expect(cluster.nodeCount).toBeGreaterThan(0)
    expect(cluster.version).toBeDefined()

    const pods = await getPods()
    expect(Array.isArray(pods)).toBe(true)
    expect(pods.length).toBeGreaterThan(0)
  })

  it('safely restarts a degraded pod in the isolated cluster environment', async () => {
    const result = await safeRestartPod('production', 'payment-service-7d8b5c984-xq29m')
    expect(result.success).toBe(true)
    expect(result.message).toContain('restarted')
  })

  it('prevents mutation of protected system namespaces', async () => {
    await expect(safeRestartPod('kube-system', 'coredns-xyz')).rejects.toThrow(
      "Protected namespace 'kube-system' cannot be modified."
    )
  })

  it('optimizes cluster resources and detects underprovisioned workloads', async () => {
    const opt = await optimizeClusterResources()
    expect(opt.workloadsNeedingAttention).toBeGreaterThan(0)
    expect(opt.recommendations.some(r => r.workloadName === 'payment-service')).toBe(true)
  })
})
