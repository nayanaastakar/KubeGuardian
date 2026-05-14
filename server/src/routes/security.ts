import { Router } from 'express'
import { Vulnerability } from '@/models/Vulnerability'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()

// Get security overview
router.get('/overview', asyncHandler(async (req, res) => {
  const totalVulnerabilities = await Vulnerability.countDocuments()
  const criticalVulnerabilities = await Vulnerability.countDocuments({ severity: 'critical' })
  const highVulnerabilities = await Vulnerability.countDocuments({ severity: 'high' })
  const mediumVulnerabilities = await Vulnerability.countDocuments({ severity: 'medium' })
  const lowVulnerabilities = await Vulnerability.countDocuments({ severity: 'low' })

  const securityScore = Math.max(0, 100 - (criticalVulnerabilities * 10 + highVulnerabilities * 5 + mediumVulnerabilities * 2 + lowVulnerabilities * 1))

  const overview = {
    totalVulnerabilities,
    criticalVulnerabilities,
    highVulnerabilities,
    mediumVulnerabilities,
    lowVulnerabilities,
    securityScore,
    lastScan: new Date().toISOString()
  }

  res.json({
    success: true,
    data: overview
  })
}))

// Get vulnerabilities
router.get('/vulnerabilities', asyncHandler(async (req, res) => {
  const { severity, clusterId, status, page = 1, limit = 20 } = req.query

  // Build filter
  const filter: any = {}
  if (severity) filter.severity = severity
  if (clusterId) filter.clusterId = clusterId
  if (status) filter.status = status

  const vulnerabilities = await Vulnerability.find(filter)
    .populate('clusterId', 'name')
    .sort({ discoveredAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))

  const total = await Vulnerability.countDocuments(filter)

  res.json({
    success: true,
    data: vulnerabilities,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  })
}))

// Create vulnerability
router.post('/vulnerabilities', asyncHandler(async (req, res) => {
  const vulnerabilityData = req.body

  const vulnerability = new Vulnerability(vulnerabilityData)
  await vulnerability.save()

  res.status(201).json({
    success: true,
    data: vulnerability
  })
}))

// Update vulnerability status
router.patch('/vulnerabilities/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, resolvedAt } = req.body

  const vulnerability = await Vulnerability.findByIdAndUpdate(
    id,
    { 
      status,
      resolvedAt: resolvedAt || new Date(),
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  )

  if (!vulnerability) {
    return res.status(404).json({
      success: false,
      error: 'Vulnerability not found'
    })
  }

  res.json({
    success: true,
    data: vulnerability
  })
}))

// Get vulnerability statistics
router.get('/vulnerabilities/stats', asyncHandler(async (req, res) => {
  const { clusterId, timeRange = '7d' } = req.query

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - parseInt(timeRange.toString().replace('d', '')))

  const filter: any = {
    discoveredAt: { $gte: startDate, $lte: endDate }
  }
  if (clusterId) filter.clusterId = clusterId

  const stats = await Vulnerability.aggregate([
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

  res.json({
    success: true,
    data: {
      timeRange,
      startDate,
      endDate,
      stats
    }
  })
}))

export default router
