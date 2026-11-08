import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import { optimizeClusterResources } from '@/services/resourceOptimizer'

const router = Router()

// Get workload resource optimization report
router.get('/', asyncHandler(async (req, res) => {
  const report = await optimizeClusterResources()
  res.json({
    success: true,
    data: report
  })
}))

export default router
