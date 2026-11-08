import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import { memoryStore, isDbConnected } from '@/services/dataStore'
import { Settings } from '@/models/Settings'

const router = Router()

// Get platform settings
router.get('/', asyncHandler(async (req, res) => {
  if (isDbConnected()) {
    try {
      let doc = await Settings.findOne()
      if (!doc) {
        doc = new Settings(memoryStore.settings)
        await doc.save()
      }
      return res.json({ success: true, data: doc })
    } catch {}
  }

  res.json({
    success: true,
    data: memoryStore.settings
  })
}))

// Update platform settings
router.post('/', asyncHandler(async (req, res) => {
  const { general, notifications, security, integrations } = req.body

  if (general) memoryStore.settings.general = { ...memoryStore.settings.general, ...general }
  if (notifications) memoryStore.settings.notifications = { ...memoryStore.settings.notifications, ...notifications }
  if (security) memoryStore.settings.security = { ...memoryStore.settings.security, ...security }
  if (integrations) memoryStore.settings.integrations = { ...memoryStore.settings.integrations, ...integrations }

  if (isDbConnected()) {
    try {
      let doc = await Settings.findOne()
      if (!doc) doc = new Settings()
      if (general) doc.general = memoryStore.settings.general
      if (notifications) doc.notifications = memoryStore.settings.notifications
      if (security) doc.security = memoryStore.settings.security
      if (integrations) doc.integrations = memoryStore.settings.integrations
      await doc.save()
    } catch {}
  }

  res.json({
    success: true,
    message: 'Platform settings updated successfully.',
    data: memoryStore.settings
  })
}))

export default router
