import { Router } from 'express'
import { Cluster } from '@/models/Cluster'
import { asyncHandler } from '@/middleware/errorHandler'
import { getNamespaces, getPods, getDeployments, getKubernetesClients } from '@/kubernetes/client'

const router = Router()

// Get cluster live metrics
router.get('/live', asyncHandler(async (req, res) => {
  try {
    // Attempt to get live kubernetes client
    getKubernetesClients() 
    
    // If successful, fetch live data
    const [namespaces, pods, deployments] = await Promise.all([
      getNamespaces(),
      getPods('default'),
      getDeployments('default')
    ])

    const totalRestarts = pods.reduce((acc: number, pod: any) => {
      const containerStatuses = pod.status?.containerStatuses || [];
      return acc + containerStatuses.reduce((sum: number, c: any) => sum + (c.restartCount || 0), 0)
    }, 0)

    const liveCluster = {
      id: 'cluster-live',
      name: 'Local K8s Cluster (Live)',
      namespaces: namespaces.length,
      pods: pods.length,
      status: pods.length > 0 ? 'Healthy' : 'Unknown',
      restarts: totalRestarts
    }

    res.json({
      success: true,
      data: [liveCluster]
    })
  } catch (error) {
    // Fallback to mock data if no cluster connected
    console.warn("Live kubernetes not available, falling back to mock.")
    const mockClusters = [
      { id: 'cluster-1', name: 'KubeGuardian Cluster (Mock)', namespaces: 16, pods: 128, status: 'Healthy', restarts: 12 },
      { id: 'cluster-2', name: 'Edge Compute Cluster (Mock)', namespaces: 11, pods: 84, status: 'Warning', restarts: 27 }
    ]
    res.json({
      success: true,
      data: mockClusters
    })
  }
}))

// Remediate by restarting pod
router.post('/remediate/pod/:namespace/:podName', asyncHandler(async (req, res) => {
  try {
    const { k8sApi } = getKubernetesClients()
    const { namespace, podName } = req.params
    await k8sApi.deleteNamespacedPod(podName, namespace)
    res.json({
      success: true,
      message: `Pod ${podName} deleted successfully for remediation.`
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Remediation failed' })
  }
}))

// Get all clusters
router.get('/', asyncHandler(async (req, res) => {
  const clusters = await Cluster.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
  res.json({ success: true, data: clusters })
}))

export default router
