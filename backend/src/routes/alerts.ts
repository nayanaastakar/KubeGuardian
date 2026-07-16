import { Router } from 'express'
import { Alert } from '@/models/Alert'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()

// Get all alerts
router.get('/', asyncHandler(async (req, res) => {
  const { severity, clusterId, status, page = 1, limit = 20 } = req.query

  try {
    // Build filter
    const filter: any = {}
    if (severity) filter.severity = severity
    if (clusterId) filter.clusterId = clusterId
    if (status) filter.status = status

    const alerts = await Alert.find(filter)
      .populate('clusterId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Alert.countDocuments(filter)

    res.json({
      success: true,
      data: alerts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    // Fallback mock alerts
    const mockAlerts = [
      { _id: 'a1', severity: 'critical', type: 'Privileged Container', message: 'Pod vulnerable-nginx is running with privileged access', clusterId: '2', namespace: 'sample-app', createdAt: new Date().toISOString() },
      { _id: 'a2', severity: 'high', type: 'Vulnerability', message: 'CVE-2023-44487 found in nginx:1.18.0', clusterId: '2', namespace: 'sample-app', createdAt: new Date().toISOString() },
      { _id: 'a3', severity: 'medium', type: 'Network Policy', message: 'Missing egress lockdown for sample-app', clusterId: '2', namespace: 'sample-app', createdAt: new Date().toISOString() }
    ]
    res.json({
      success: true,
      data: mockAlerts,
      pagination: { page: 1, limit: 20, total: 2, pages: 1 },
      isDemo: true
    })
  }
}))

// Get single alert
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  
  const alert = await Alert.findById(id)
    .populate('clusterId', 'name')
  
  if (!alert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found'
    })
  }

  res.json({
    success: true,
    data: alert
  })
}))

// Create alert
router.post('/', asyncHandler(async (req, res) => {
  const alertData = req.body

  const alert = new Alert(alertData)
  await alert.save()

  res.status(201).json({
    success: true,
    data: alert
  })
}))

// Update alert status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, acknowledgedAt, resolvedAt } = req.body

  const updateData: any = { 
    status,
    updatedAt: new Date()
  }

  if (status === 'acknowledged') {
    updateData.acknowledgedAt = acknowledgedAt || new Date()
  }
  
  if (status === 'resolved') {
    updateData.resolvedAt = resolvedAt || new Date()
  }

  const alert = await Alert.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found'
    })
  }

  res.json({
    success: true,
    data: alert
  })
}))

// Get alert statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const { clusterId, timeRange = '24h' } = req.query

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  
  if (timeRange.toString().includes('h')) {
    const hours = parseInt(timeRange.toString().replace('h', ''))
    startDate.setHours(endDate.getHours() - hours)
  } else if (timeRange.toString().includes('d')) {
    const days = parseInt(timeRange.toString().replace('d', ''))
    startDate.setDate(endDate.getDate() - days)
  }

  const filter: any = {
    createdAt: { $gte: startDate, $lte: endDate }
  }
  if (clusterId) filter.clusterId = clusterId

  const stats = await Alert.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])

  const statusStats = await Alert.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])

  res.json({
    success: true,
    data: {
      timeRange,
      startDate,
      endDate,
      severityStats: stats,
      statusStats
    }
  })
}))

// Delete alert
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  const alert = await Alert.findByIdAndDelete(id)
  
  if (!alert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found'
    })
  }

  res.json({
    success: true,
    message: 'Alert deleted successfully'
  })
}))

export default router
