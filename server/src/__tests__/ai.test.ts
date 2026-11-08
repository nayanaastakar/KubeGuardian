import { chatDevSecOps, analyzeLogsWithAi } from '../services/aiService'

describe('AI DevSecOps Diagnostic & Log RCA Engine', () => {
  it('diagnoses OOMKilled exit code 137 in DevSecOps chat', async () => {
    const res = await chatDevSecOps('My pod is failing with exit code 137')
    expect(res.content).toContain('137')
    expect(res.suggestedCommands).toBeDefined()
    expect(res.suggestedCommands?.length).toBeGreaterThan(0)
  })

  it('provides least-privilege RBAC advice', async () => {
    const res = await chatDevSecOps('What is the risk of cluster-admin binding on a default service account?')
    expect(res.content).toContain('RBAC')
    expect(res.confidence).toBeGreaterThan(0.8)
  })

  it('analyzes log content and extracts exit code and root cause', async () => {
    const logs = `
2026-11-06T00:10:00Z [payment-service] OutOfMemoryError: Java heap space
2026-11-06T00:10:01Z kubelet: Container terminated with exit code 137
`
    const rca = await analyzeLogsWithAi(logs, 'application')
    expect(rca.severity).toBe('critical')
    expect(rca.detectedExitCode).toBe(137)
    expect(rca.recommendations.length).toBeGreaterThan(0)
    expect(rca.suggestedPatchYaml).toContain('limits')
  })
})
