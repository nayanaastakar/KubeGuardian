import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import { memoryStore } from '@/services/dataStore'
import { scanContainerImage, scanManifestContent } from '@/security/trivyScanner'

const router = Router()

// Get all security scans
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: memoryStore.scans
  })
}))

// Start new scan (image or manifest)
router.post('/start', asyncHandler(async (req, res) => {
  const { type, target, manifestContent } = req.body

  if (!type || !target) {
    return res.status(400).json({
      success: false,
      error: 'Scan type (image or manifest) and target are required'
    })
  }

  let result
  if (type === 'image') {
    result = await scanContainerImage(target)
  } else if (type === 'manifest') {
    result = await scanManifestContent(manifestContent || target, target)
  } else {
    return res.status(400).json({ success: false, error: 'Invalid scan type' })
  }

  res.status(201).json({
    success: true,
    data: result
  })
}))

export default router
