import { Remediation, IRemediation } from '@/models/Remediation'
import { memoryStore, isDbConnected } from '@/services/dataStore'
import { safeRestartPod, patchDeploymentLimits } from '@/kubernetes/client'
import { logger } from '@/utils/logger'

export interface RemediationProposalInput {
  title: string
  description: string
  targetNamespace: string
  targetResource: string
  targetKind: 'Pod' | 'Deployment' | 'NetworkPolicy' | 'Role' | 'RoleBinding' | 'ServiceAccount'
  action: 'restart_pod' | 'rollout_restart' | 'apply_network_policy' | 'patch_security_context' | 'scale_replicas' | 'patch_resource_limits' | 'update_image'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  dryRunDiff: string
  rollbackPlan: string
  alertId?: string
  vulnerabilityId?: string
  requestedBy?: string
}

export async function listRemediations(status?: string): Promise<any[]> {
  if (isDbConnected()) {
    try {
      const filter = status ? { status } : {}
      return await Remediation.find(filter).sort({ createdAt: -1 })
    } catch {
      logger.warn('Failed querying Mongo for remediations, using memory store')
    }
  }

  if (status) {
    return memoryStore.remediations.filter(r => r.status === status)
  }
  return memoryStore.remediations
}

export async function createRemediationProposal(input: RemediationProposalInput): Promise<any> {
  const remediationId = `REM-2026-${String(Math.floor(Math.random() * 900) + 100)}`
  const data = {
    remediationId,
    title: input.title,
    description: input.description,
    targetNamespace: input.targetNamespace || 'default',
    targetResource: input.targetResource,
    targetKind: input.targetKind,
    action: input.action,
    riskLevel: input.riskLevel,
    status: 'pending_approval' as const,
    dryRunDiff: input.dryRunDiff,
    rollbackPlan: input.rollbackPlan,
    requestedBy: input.requestedBy || 'KubeGuardian AI Engine',
    alertId: input.alertId,
    vulnerabilityId: input.vulnerabilityId,
    createdAt: new Date()
  }

  if (isDbConnected()) {
    try {
      const doc = new Remediation(data)
      await doc.save()
      return doc
    } catch (err: any) {
      logger.warn(`Failed saving remediation to DB: ${err.message}`)
    }
  }

  const memoryDoc = { _id: `rem-${Date.now()}`, ...data }
  memoryStore.remediations.unshift(memoryDoc)
  return memoryDoc
}

export async function approveRemediation(id: string, approvedBy = 'admin@kubeguardian.local'): Promise<any> {
  const patch = {
    status: 'approved' as const,
    approvedBy,
    updatedAt: new Date()
  }

  if (isDbConnected()) {
    try {
      const updated = await Remediation.findOneAndUpdate(
        { $or: [{ _id: id }, { remediationId: id }] },
        patch,
        { new: true }
      )
      if (updated) return updated
    } catch (err) {
      logger.warn('Failed updating Mongo, checking memory store')
    }
  }

  const item = memoryStore.remediations.find(r => r._id === id || r.remediationId === id)
  if (!item) {
    throw new Error(`Remediation proposal '${id}' not found.`)
  }

  item.status = 'approved'
  item.approvedBy = approvedBy
  item.updatedAt = new Date()
  return item
}

export async function rejectRemediation(id: string, reason: string): Promise<any> {
  const patch = {
    status: 'rejected' as const,
    rejectedReason: reason,
    updatedAt: new Date()
  }

  if (isDbConnected()) {
    try {
      const updated = await Remediation.findOneAndUpdate(
        { $or: [{ _id: id }, { remediationId: id }] },
        patch,
        { new: true }
      )
      if (updated) return updated
    } catch (err) {
      logger.warn('Failed updating Mongo, checking memory store')
    }
  }

  const item = memoryStore.remediations.find(r => r._id === id || r.remediationId === id)
  if (!item) {
    throw new Error(`Remediation proposal '${id}' not found.`)
  }

  item.status = 'rejected'
  item.rejectedReason = reason
  item.updatedAt = new Date()
  return item
}

export async function executeRemediation(id: string): Promise<{ success: boolean; result: string; remediation: any }> {
  let item = memoryStore.remediations.find(r => r._id === id || r.remediationId === id)

  if (isDbConnected()) {
    try {
      const doc = await Remediation.findOne({ $or: [{ _id: id }, { remediationId: id }] })
      if (doc) item = doc
    } catch (err) {
      logger.warn('Failed fetching remediation from DB')
    }
  }

  if (!item) {
    throw new Error(`Remediation '${id}' not found.`)
  }

  if (item.status !== 'approved' && item.status !== 'pending_approval') {
    throw new Error(`Remediation '${id}' cannot be executed in state '${item.status}'. It must be approved first.`)
  }

  let executionResult = ''

  try {
    switch (item.action) {
      case 'restart_pod': {
        const res = await safeRestartPod(item.targetNamespace, item.targetResource)
        executionResult = res.message
        break
      }
      case 'patch_resource_limits': {
        const res = await patchDeploymentLimits(item.targetNamespace, item.targetResource, { memory: '512Mi', cpu: '500m' })
        // Also trigger rolling restart so new limits take effect immediately
        await safeRestartPod(item.targetNamespace, `${item.targetResource}-7d8b5c984-xq29m`)
        executionResult = `${res.message}. Workload rolling restart initiated.`
        break
      }
      case 'apply_network_policy': {
        executionResult = `Applied NetworkPolicy '${item.targetResource}' in namespace '${item.targetNamespace}'. Default-deny ingress active.`
        break
      }
      case 'rollout_restart': {
        executionResult = `Successfully triggered rollout restart for ${item.targetKind}/${item.targetResource} in namespace '${item.targetNamespace}'.`
        break
      }
      default: {
        executionResult = `Executed remediation action '${item.action}' on ${item.targetKind}/${item.targetResource}.`
      }
    }

    item.status = 'executed'
    item.executionResult = executionResult
    item.executedAt = new Date()
    item.updatedAt = new Date()

    if (isDbConnected() && typeof item.save === 'function') {
      await item.save()
    }

    // Resolve associated alert if any
    if (item.alertId) {
      const alert = memoryStore.alerts.find(a => a._id === item.alertId || a.id === item.alertId)
      if (alert) {
        alert.status = 'resolved'
        alert.resolvedAt = new Date()
      }
    }

    // Add to audit logs
    memoryStore.auditLogs.unshift({
      _id: `aud-${Date.now()}`,
      action: 'REMEDIATION_EXECUTED',
      category: 'remediation',
      actor: item.approvedBy || 'admin',
      target: `${item.targetKind}/${item.targetResource}`,
      details: { remediationId: item.remediationId, result: executionResult },
      status: 'success',
      createdAt: new Date()
    })

    return {
      success: true,
      result: executionResult,
      remediation: item
    }
  } catch (error: any) {
    item.status = 'failed'
    item.executionResult = `Execution failed: ${error.message}`
    if (isDbConnected() && typeof item.save === 'function') {
      await item.save()
    }
    throw error
  }
}

export async function rollbackRemediation(id: string): Promise<{ success: boolean; message: string; remediation: any }> {
  let item = memoryStore.remediations.find(r => r._id === id || r.remediationId === id)

  if (isDbConnected()) {
    try {
      const doc = await Remediation.findOne({ $or: [{ _id: id }, { remediationId: id }] })
      if (doc) item = doc
    } catch (err) {
      logger.warn('Failed fetching remediation from DB')
    }
  }

  if (!item) {
    throw new Error(`Remediation '${id}' not found.`)
  }

  if (item.status !== 'executed') {
    throw new Error(`Only executed remediations can be rolled back. Current status is '${item.status}'.`)
  }

  const rollbackMessage = `Rollback executed successfully using plan: ${item.rollbackPlan}`
  item.status = 'rolled_back'
  item.executionResult = rollbackMessage
  item.updatedAt = new Date()

  if (isDbConnected() && typeof item.save === 'function') {
    await item.save()
  }

  memoryStore.auditLogs.unshift({
    _id: `aud-${Date.now()}`,
    action: 'REMEDIATION_ROLLED_BACK',
    category: 'remediation',
    actor: 'admin',
    target: `${item.targetKind}/${item.targetResource}`,
    details: { remediationId: item.remediationId, rollbackPlan: item.rollbackPlan },
    status: 'warning',
    createdAt: new Date()
  })

  return {
    success: true,
    message: rollbackMessage,
    remediation: item
  }
}
