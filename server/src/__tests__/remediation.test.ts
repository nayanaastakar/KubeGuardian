import {
  createRemediationProposal,
  approveRemediation,
  rejectRemediation,
  executeRemediation,
  rollbackRemediation,
  listRemediations
} from '../services/remediationEngine'

describe('Approval-Based Remediation Engine (Service Unit Tests)', () => {
  it('lists default seeded remediation proposals', async () => {
    const list = await listRemediations()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('proposes a new remediation and places it in pending_approval', async () => {
    const proposal = await createRemediationProposal({
      title: 'Patch Memory Limit for Catalog Service',
      description: 'Increase memory limit to 512Mi to prevent OOMKilled events',
      targetNamespace: 'production',
      targetResource: 'catalog-service',
      targetKind: 'Deployment',
      action: 'patch_resource_limits',
      riskLevel: 'medium',
      dryRunDiff: '--- memory: 256Mi\n+++ memory: 512Mi',
      rollbackPlan: 'kubectl set resources deployment catalog-service -n production --limits=memory=256Mi'
    })

    expect(proposal.remediationId).toMatch(/^REM-2026-/)
    expect(proposal.status).toBe('pending_approval')
    expect(proposal.riskLevel).toBe('medium')
    expect(proposal.rollbackPlan).toBeDefined()
  })

  it('approves a pending remediation proposal', async () => {
    const proposal = await createRemediationProposal({
      title: 'Isolate namespace dev-ops',
      description: 'Enforce default-deny network policy',
      targetNamespace: 'dev-ops',
      targetResource: 'default-deny',
      targetKind: 'NetworkPolicy',
      action: 'apply_network_policy',
      riskLevel: 'low',
      dryRunDiff: '+ kind: NetworkPolicy',
      rollbackPlan: 'kubectl delete networkpolicy default-deny -n dev-ops'
    })

    const approved = await approveRemediation(proposal.remediationId, 'lead-secops@kubeguardian.local')
    expect(approved.status).toBe('approved')
    expect(approved.approvedBy).toBe('lead-secops@kubeguardian.local')
  })

  it('rejects a remediation proposal with reason', async () => {
    const proposal = await createRemediationProposal({
      title: 'Dangerous namespace deletion test',
      description: 'Delete test namespace',
      targetNamespace: 'test',
      targetResource: 'test',
      targetKind: 'Pod',
      action: 'restart_pod',
      riskLevel: 'critical',
      dryRunDiff: '',
      rollbackPlan: ''
    })

    const rejected = await rejectRemediation(proposal.remediationId, 'Risk too high for unapproved namespace.')
    expect(rejected.status).toBe('rejected')
    expect(rejected.rejectedReason).toBe('Risk too high for unapproved namespace.')
  })

  it('executes approved remediation and allows rollback', async () => {
    const proposal = await createRemediationProposal({
      title: 'Restart stalled payment service pod',
      description: 'Restart pod to trigger clean replica',
      targetNamespace: 'production',
      targetResource: 'payment-service',
      targetKind: 'Pod',
      action: 'restart_pod',
      riskLevel: 'low',
      dryRunDiff: 'pod restart',
      rollbackPlan: 'no rollback needed for restart'
    })

    await approveRemediation(proposal.remediationId, 'operator@kubeguardian.local')
    const execution = await executeRemediation(proposal.remediationId)
    expect(execution.success).toBe(true)
    expect(execution.remediation.status).toBe('executed')

    const rollback = await rollbackRemediation(proposal.remediationId)
    expect(rollback.success).toBe(true)
    expect(rollback.remediation.status).toBe('rolled_back')
  })
})
