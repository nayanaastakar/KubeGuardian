import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import { analyzeRbacSecurity } from '@/security/rbacAnalyzer'

const router = Router()

// Run and get RBAC security analysis
router.get('/analysis', asyncHandler(async (req, res) => {
  const result = await analyzeRbacSecurity()
  res.json({
    success: true,
    data: result
  })
}))

export default router
