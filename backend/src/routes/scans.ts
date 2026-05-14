import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()

// Get all scans
router.get('/', asyncHandler(async (req, res) => {
  const scans = [
    {
      id: 'run-894',
      type: 'image',
      status: 'completed',
      repo: 'backend-api',
      branch: 'main',
      image: 'kubeguardian/backend:latest',
      startedAt: new Date(Date.now() - 720000).toISOString(),
      completedAt: new Date(Date.now() - 600000).toISOString(),
      vulnerabilitiesFound: 0,
      duration: '2m 10s'
    },
    {
      id: 'run-893',
      type: 'image',
      status: 'failed',
      repo: 'payment-service',
      branch: 'feature/stripe',
      image: 'kubeguardian/payments:beta',
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3500000).toISOString(),
      vulnerabilitiesFound: 3,
      duration: '1m 45s'
    },
    {
      id: 'run-892',
      type: 'image',
      status: 'completed',
      repo: 'frontend-app',
      branch: 'main',
      image: 'kubeguardian/frontend:v1.2.0',
      startedAt: new Date(Date.now() - 10800000).toISOString(),
      completedAt: new Date(Date.now() - 10600000).toISOString(),
      vulnerabilitiesFound: 0,
      duration: '3m 20s'
    }
  ]

  res.json({
    success: true,
    data: scans
  })
}))

// Start new scan
router.post('/start', asyncHandler(async (req, res) => {
  const { type, target, config } = req.body

  if (!type || !target) {
    return res.status(400).json({
      success: false,
      error: 'Scan type and target are required'
    })
  }

  const scan = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    target,
    status: 'pending',
    startedAt: new Date().toISOString()
  }

  res.status(201).json({
    success: true,
    data: scan
  })
}))

export default router
