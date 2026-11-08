import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import { memoryStore, isDbConnected } from '@/services/dataStore'
import { Alert } from '@/models/Alert'

const router = Router()

// Get all alerts with filtering & pagination
router.get('/', asyncHandler(async (req, res) => {
  const { severity, status, namespace, search } = req.query

  let items = memoryStore.alerts

  if (isDbConnected()) {
    try {
      const filter: any = {}
      if (severity && severity !== 'all') filter.severity = severity
      if (status && status !== 'all') filter.status = status
      items = await Alert.find(filter).sort({ createdAt: -1 })
    } catch {
      items = memoryStore.alerts
    }
  }

  if (severity && severity !== 'all') {
    items = items.filter(a => a.severity === severity)
  }
  if (status && status !== 'all') {
    items = items.filter(a => a.status === status)
  }
  if (namespace && namespace !== 'all') {
    items = items.filter(a => a.namespace === namespace)
  }
  if (search) {
    const s = String(search).toLowerCase()
    items = items.filter(a => a.title.toLowerCase().includes(s) || a.description.toLowerCase().includes(s))
  }

  res.json({
    success: true,
    data: items,
    total: items.length
  })
}))

// Get single alert
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const alert = memoryStore.alerts.find(a => a._id === id || a.id === id)
  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' })
  }
  res.json({ success: true, data: alert })
}))

// Acknowledge alert
router.post('/:id/acknowledge', asyncHandler(async (req, res) => {
  const { id } = req.params
  const alert = memoryStore.alerts.find(a => a._id === id || a.id === id)
  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' })
  }

  alert.status = 'acknowledged'
  alert.acknowledgedAt = new Date()

  if (isDbConnected()) {
    try {
      await Alert.findOneAndUpdate({ _id: id }, { status: 'acknowledged', acknowledgedAt: new Date() })
    } catch {}
  }

  res.json({ success: true, data: alert, message: 'Alert acknowledged' })
}))

// Resolve alert
router.post('/:id/resolve', asyncHandler(async (req, res) => {
  const { id } = req.params
  const alert = memoryStore.alerts.find(a => a._id === id || a.id === id)
  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' })
  }

  alert.status = 'resolved'
  alert.resolvedAt = new Date()

  if (isDbConnected()) {
    try {
      await Alert.findOneAndUpdate({ _id: id }, { status: 'resolved', resolvedAt: new Date() })
    } catch {}
  }

  res.json({ success: true, data: alert, message: 'Alert resolved' })
}))

export default router
