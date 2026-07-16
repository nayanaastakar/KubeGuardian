import { Router } from 'express'
import { Cluster } from '@/models/Cluster'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()

// Get all clusters
router.get('/', asyncHandler(async (req, res) => {
  const clusters = await Cluster.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })

  res.json({
    success: true,
    data: clusters
  })
}))

// Get single cluster
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  
  const cluster = await Cluster.findById(id)
    .populate('createdBy', 'name email')
  
  if (!cluster) {
    return res.status(404).json({
      success: false,
      error: 'Cluster not found'
    })
  }

  res.json({
    success: true,
    data: cluster
  })
}))

// Connect new cluster
router.post('/connect', asyncHandler(async (req, res) => {
  const { name, endpoint, kubeconfig, createdBy } = req.body

  // Validation
  if (!name || !endpoint || !kubeconfig || !createdBy) {
    return res.status(400).json({
      success: false,
      error: 'Name, endpoint, kubeconfig, and createdBy are required'
    })
  }

  // Create cluster
  const newCluster = new Cluster({
    name,
    endpoint,
    kubeconfig,
    createdBy,
    status: 'connecting'
  })

  await newCluster.save()

  res.status(201).json({
    success: true,
    data: newCluster
  })
}))

// Update cluster status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, nodeCount, namespaceCount, podCount, version } = req.body

  const cluster = await Cluster.findByIdAndUpdate(
    id,
    { 
      status,
      nodeCount,
      namespaceCount,
      podCount,
      version,
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  )

  if (!cluster) {
    return res.status(404).json({
      success: false,
      error: 'Cluster not found'
    })
  }

  res.json({
    success: true,
    data: cluster
  })
}))

// Delete cluster
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  const cluster = await Cluster.findByIdAndDelete(id)
  
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
