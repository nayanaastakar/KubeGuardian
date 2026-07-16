import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()

// Get all scans
router.get('/', asyncHandler(async (req, res) => {
  const scans = [
    {
      id: '1',
      type: 'image',
      status: 'completed',
      clusterId: '1',
      image: 'nginx:1.18.0',
      startedAt: '2024-01-15T09:00:00Z',
      completedAt: '2024-01-15T09:15:00Z',
      vulnerabilitiesFound: 5,
      vulnerabilities: []
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
