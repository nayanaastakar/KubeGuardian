import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import {
  listRemediations,
  createRemediationProposal,
  approveRemediation,
  rejectRemediation,
  executeRemediation,
  rollbackRemediation
} from '@/services/remediationEngine'

const router = Router()

// List all remediation proposals & history
router.get('/', asyncHandler(async (req, res) => {
  const { status } = req.query
  const remediations = await listRemediations(status as string)
  res.json({
    success: true,
    data: remediations
  })
}))

// Propose a new remediation
router.post('/propose', asyncHandler(async (req, res) => {
  const proposal = await createRemediationProposal(req.body)
  res.status(201).json({
    success: true,
    message: 'Remediation proposal created and awaiting approval.',
    data: proposal
  })
}))

// Approve remediation
router.post('/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { approvedBy } = req.body
  const remediation = await approveRemediation(id, approvedBy || req.user?.email || 'admin@kubeguardian.local')
  res.json({
    success: true,
    message: `Remediation ${id} has been approved.`,
    data: remediation
  })
}))

// Reject remediation
router.post('/:id/reject', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { reason } = req.body
  const remediation = await rejectRemediation(id, reason || 'Rejected by operator.')
  res.json({
    success: true,
    message: `Remediation ${id} has been rejected.`,
    data: remediation
  })
}))

// Safely execute approved remediation
router.post('/:id/execute', asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await executeRemediation(id)
  res.json({
    success: true,
    message: result.result,
    data: result.remediation
  })
}))

// Rollback executed remediation
router.post('/:id/rollback', asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await rollbackRemediation(id)
  res.json({
    success: true,
    message: result.message,
    data: result.remediation
  })
}))

export default router
