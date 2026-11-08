import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import { chatDevSecOps, analyzeLogsWithAi } from '@/services/aiService'

const router = Router()

// AI DevSecOps Chat endpoint
router.post('/chat', asyncHandler(async (req, res) => {
  const { message, context } = req.body

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'A valid message string is required.' })
  }

  const response = await chatDevSecOps(message, context)
  res.json({
    success: true,
    data: response
  })
}))

// Analyze Kubernetes and Container Logs
router.post('/analyze-logs', asyncHandler(async (req, res) => {
  const { logs, type, clusterId } = req.body

  if (!logs || typeof logs !== 'string') {
    return res.status(400).json({ success: false, error: 'Logs string content is required.' })
  }

  const analysis = await analyzeLogsWithAi(logs, type, clusterId)
  res.json({
    success: true,
    data: analysis
  })
}))

export default router
