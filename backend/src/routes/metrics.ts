import { Router } from 'express'
import { Cluster } from '@/models/Cluster'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()

// Get cluster metrics
router.get('/cluster/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  
  const cluster = await Cluster.findById(id)
  if (!cluster) {
    return res.status(404).json({
      success: false,
      error: 'Cluster not found'
    })
  }

  // Mock metrics data (would be fetched from Prometheus in real implementation)
  const metrics = {
    clusterId: id,
    cpuUsage: Math.floor(Math.random() * 100),
    memoryUsage: Math.floor(Math.random() * 100),
    diskUsage: Math.floor(Math.random() * 100),
    networkIO: {
      bytesIn: Math.floor(Math.random() * 1000000),
      bytesOut: Math.floor(Math.random() * 500000)
    },
    podCount: cluster.podCount,
    runningPods: Math.max(0, cluster.podCount - Math.floor(Math.random() * 5)),
    failedPods: Math.min(5, Math.floor(Math.random() * 5)),
    timestamp: new Date().toISOString()
  }

  res.json({
    success: true,
    data: metrics
  })
}))

// Get all clusters metrics summary
router.get('/summary', asyncHandler(async (req, res) => {
  const clusters = await Cluster.find()
  
  const metrics = clusters.map(cluster => ({
    clusterId: cluster._id,
    clusterName: cluster.name,
    status: cluster.status,
    cpuUsage: Math.floor(Math.random() * 100),
    memoryUsage: Math.floor(Math.random() * 100),
    diskUsage: Math.floor(Math.random() * 100),
    podCount: cluster.podCount,
    nodeCount: cluster.nodeCount,
    timestamp: new Date().toISOString()
  }))

  res.json({
    success: true,
    data: metrics
  })
}))

export default router
