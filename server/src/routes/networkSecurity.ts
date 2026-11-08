import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import { analyzeNetworkSecurity } from '@/security/networkPolicyAnalyzer'

const router = Router()

// Run and get network security analysis
router.get('/analysis', asyncHandler(async (req, res) => {
  const result = await analyzeNetworkSecurity()
  res.json({
    success: true,
    data: result
  })
}))

export default router
