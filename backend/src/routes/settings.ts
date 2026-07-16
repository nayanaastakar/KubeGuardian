import { Router } from 'express'
import { Settings } from '@/models/Settings'
import { asyncHandler, CustomError } from '@/middleware/errorHandler'
import { authMiddleware } from '@/middleware/auth'
import { Response, NextFunction } from 'express'

const router = Router()

// Middleware to check if user is admin
const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user.role !== 'admin' && req.user.role !== 'devops_engineer') {
    throw new CustomError('Forbidden: Admin access required', 403)
  }
  next()
}

// Get settings
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  let settings = await Settings.findOne()
  
  if (!settings) {
    settings = new Settings()
    await settings.save()
  }

  res.json({
    success: true,
    data: settings
  })
}))

// Update settings
router.post('/', authMiddleware, isAdmin, asyncHandler(async (req, res) => {
  let settings = await Settings.findOne()
  
  if (!settings) {
    settings = new Settings()
  }

  const { integrations, notifications, securityPolicies } = req.body

  if (integrations) settings.integrations = { ...settings.integrations, ...integrations }
  if (notifications) settings.notifications = { ...settings.notifications, ...notifications }
  if (securityPolicies) settings.securityPolicies = { ...settings.securityPolicies, ...securityPolicies }

  await settings.save()

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: settings
  })
}))

export default router
