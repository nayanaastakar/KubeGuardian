import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import { memoryStore, isDbConnected } from '@/services/dataStore'
import { Vulnerability } from '@/models/Vulnerability'

const router = Router()

// Get security overview and dynamic security score
router.get('/overview', asyncHandler(async (req, res) => {
  let vulns = memoryStore.vulnerabilities

  if (isDbConnected()) {
    try {
      vulns = await Vulnerability.find()
    } catch {
      vulns = memoryStore.vulnerabilities
    }
  }

  const activeVulns = vulns.filter(v => v.status !== 'resolved')
  const totalVulnerabilities = activeVulns.length
  const criticalVulnerabilities = activeVulns.filter(v => v.severity === 'critical').length
  const highVulnerabilities = activeVulns.filter(v => v.severity === 'high').length
  const mediumVulnerabilities = activeVulns.filter(v => v.severity === 'medium').length
  const lowVulnerabilities = activeVulns.filter(v => v.severity === 'low').length

  // Calculate actual security score based strictly on active findings
  // Max 100 points, deductions for critical/high/medium/low
  const deductions = (criticalVulnerabilities * 12) + (highVulnerabilities * 6) + (mediumVulnerabilities * 2) + (lowVulnerabilities * 0.5)
  const securityScore = Math.max(10, Math.min(100, Math.round(100 - deductions)))

  const namespaceScore = Math.max(15, Math.min(100, Math.round(securityScore - 5)))
  const deploymentScore = Math.max(20, Math.min(100, Math.round(securityScore + 4)))

  const overview = {
    totalVulnerabilities,
    criticalVulnerabilities,
    highVulnerabilities,
    mediumVulnerabilities,
    lowVulnerabilities,
    securityScore,
    namespaceScore,
    deploymentScore,
    lastScan: new Date().toISOString()
  }

  res.json({
    success: true,
    data: overview
  })
}))

// Get list of vulnerabilities with filter & pagination
router.get('/vulnerabilities', asyncHandler(async (req, res) => {
  const { severity, status, search, page = 1, limit = 50 } = req.query

  let items = memoryStore.vulnerabilities

  if (isDbConnected()) {
    try {
      const filter: any = {}
      if (severity && severity !== 'all') filter.severity = severity
      if (status && status !== 'all') filter.status = status
      items = await Vulnerability.find(filter).sort({ discoveredAt: -1 })
    } catch {
      items = memoryStore.vulnerabilities
    }
  }

  if (severity && severity !== 'all') {
    items = items.filter(v => v.severity === severity)
  }
  if (status && status !== 'all') {
    items = items.filter(v => v.status === status)
  }
  if (search) {
    const s = String(search).toLowerCase()
    items = items.filter(v => 
      v.cveId?.toLowerCase().includes(s) || 
      v.package?.toLowerCase().includes(s) || 
      v.title?.toLowerCase().includes(s)
    )
  }

  const total = items.length
  const pageNum = Number(page)
  const limitNum = Number(limit)
  const paginated = items.slice((pageNum - 1) * limitNum, pageNum * limitNum)

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  })
}))

// Update vulnerability status (active, resolved, ignored)
router.patch('/vulnerabilities/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (isDbConnected()) {
    try {
      const doc = await Vulnerability.findOneAndUpdate(
        { $or: [{ _id: id }, { cveId: id }] },
        { status, resolvedAt: status === 'resolved' ? new Date() : undefined },
        { new: true }
      )
      if (doc) return res.json({ success: true, data: doc })
    } catch {
      // fallback to memory
    }
  }

  const vuln = memoryStore.vulnerabilities.find(v => v._id === id || v.cveId === id)
  if (!vuln) {
    return res.status(404).json({ success: false, error: 'Vulnerability not found' })
  }

  vuln.status = status
  if (status === 'resolved') {
    vuln.resolvedAt = new Date()
  }

  res.json({
    success: true,
    data: vuln
  })
}))

export default router
