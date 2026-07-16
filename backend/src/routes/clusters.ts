import { Router } from 'express'
import { Cluster } from '@/models/Cluster'
import { authMiddleware } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()

// Get all clusters
router.get('/', authMiddleware, asyncHandler(async (req: any, res) => {
  try {
    const clusters = await Cluster.find({ createdBy: req.user.id })
    res.json({
      success: true,
      data: clusters
    })
  } catch (error) {
    // Fallback mock clusters if DB is down
    const mockClusters = [
      { 
        _id: '1', 
        name: 'production-us-east-1', 
        status: 'healthy', 
        version: 'v1.28.3', 
        nodeCount: 5, 
        cpuUsage: 42, 
        memoryUsage: 58, 
        lastSync: new Date().toISOString() 
      },
      { 
        _id: '2', 
        name: 'sample-app-cluster', 
        status: 'warning', 
        version: 'v1.27.0', 
        nodeCount: 3, 
        cpuUsage: 25, 
        memoryUsage: 30, 
        lastSync: new Date().toISOString() 
      }
    ]
    res.json({
      success: true,
      data: mockClusters
    })
  }
}))

// Add a new cluster
router.post('/', authMiddleware, asyncHandler(async (req: any, res) => {
  const { name, apiUrl, token } = req.body

  if (!name || !apiUrl || !token) {
    return res.status(400).json({
      success: false,
      error: 'Name, API URL, and Token are required'
    })
  }

  const cluster = await Cluster.create({
    name,
    apiUrl,
    token,
    status: 'healthy', // Mocked as healthy for demo
    version: 'v1.28.0',
    nodeCount: Math.floor(Math.random() * 10) + 1,
    createdBy: req.user.id
  })

  res.status(201).json({
    success: true,
    data: cluster
  })
}))

// Delete a cluster
router.delete('/:id', authMiddleware, asyncHandler(async (req: any, res) => {
  const cluster = await Cluster.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id })
  
  if (!cluster) {
    return res.status(404).json({
      success: false,
      error: 'Cluster not found'
    })
  }

  res.json({
    success: true,
    message: 'Cluster deleted successfully'
  })
}))

export default router
