import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import { getClusterInfo, getNamespaces, getPods, getDeployments, safeRestartPod } from '@/kubernetes/client'
import { memoryStore } from '@/services/dataStore'

const router = Router()

// Get cluster live metrics and summary
router.get('/live', asyncHandler(async (req, res) => {
  const [clusterInfo, namespaces, pods, deployments] = await Promise.all([
    getClusterInfo(),
    getNamespaces(),
    getPods(),
    getDeployments()
  ])

  const totalRestarts = pods.reduce((acc: number, pod: any) => {
    const containerStatuses = pod.status?.containerStatuses || []
    return acc + containerStatuses.reduce((sum: number, c: any) => sum + (c.restartCount || 0), 0)
  }, 0)

  const activePods = pods.filter(p => p.status?.phase === 'Running').length
  const unhealthyPods = pods.filter(p => {
    const containerStatuses = p.status?.containerStatuses || []
    return containerStatuses.some((c: any) => !c.ready || c.state?.waiting?.reason === 'CrashLoopBackOff')
  }).length

  const liveCluster = {
    id: 'cl-live-01',
    name: clusterInfo.isLive ? 'Connected Kubernetes Cluster (Live)' : 'KubeGuardian Safe Isolated Cluster',
    isLive: clusterInfo.isLive,
    version: (clusterInfo.version as any)?.gitVersion || 'v1.28.4',
    nodes: clusterInfo.nodeCount,
    namespaces: namespaces.length,
    pods: pods.length,
    activePods,
    unhealthyPods,
    deployments: deployments.length,
    status: unhealthyPods > 0 ? 'Degraded' : 'Healthy',
    restarts: totalRestarts
  }

  res.json({
    success: true,
    data: [liveCluster]
  })
}))

// Get list of pods with status and restarts
router.get('/pods', asyncHandler(async (req, res) => {
  const { namespace } = req.query
  const pods = await getPods(namespace as string)

  const formattedPods = pods.map((pod: any) => {
    const containerStatuses = pod.status?.containerStatuses || []
    const restarts = containerStatuses.reduce((sum: number, c: any) => sum + (c.restartCount || 0), 0)
    const isReady = containerStatuses.every((c: any) => c.ready)
    const waitingReason = containerStatuses.find((c: any) => c.state?.waiting)?.state?.waiting?.reason

    return {
      name: pod.metadata?.name,
      namespace: pod.metadata?.namespace,
      node: pod.spec?.nodeName || 'unassigned',
      status: waitingReason || (isReady ? 'Running' : 'Degraded'),
      ready: isReady,
      restarts,
      cpuLimit: pod.spec?.containers?.[0]?.resources?.limits?.cpu || 'Unset',
      memoryLimit: pod.spec?.containers?.[0]?.resources?.limits?.memory || 'Unset',
      image: pod.spec?.containers?.[0]?.image || 'unknown',
      createdAt: pod.metadata?.creationTimestamp || new Date()
    }
  })

  res.json({
    success: true,
    data: formattedPods
  })
}))

// Get list of nodes and resource metrics
router.get('/nodes', asyncHandler(async (req, res) => {
  const clusterInfo = await getClusterInfo()
  const nodes = clusterInfo.nodes.map((node: any) => ({
    name: node.metadata?.name,
    status: node.status?.conditions?.find((c: any) => c.type === 'Ready')?.status === 'True' ? 'Healthy' : 'Degraded',
    cpu: node.metrics?.cpuPercent ? `${node.metrics.cpuPercent}%` : '64%',
    ram: node.metrics?.memoryPercent ? `${node.metrics.memoryPercent}%` : '58%',
    pods: node.metrics?.podCount || 12,
    kubeletVersion: node.status?.nodeInfo?.kubeletVersion || 'v1.28.4',
    osImage: node.status?.nodeInfo?.osImage || 'Linux'
  }))

  res.json({
    success: true,
    data: nodes
  })
}))

// Get namespaces
router.get('/namespaces', asyncHandler(async (req, res) => {
  const namespaces = await getNamespaces()
  res.json({
    success: true,
    data: namespaces.map((n: any) => n.metadata?.name)
  })
}))

// Direct pod remediation (restart pod)
router.post('/remediate/pod/:namespace/:podName', asyncHandler(async (req, res) => {
  const { namespace, podName } = req.params
  const result = await safeRestartPod(namespace, podName)
  res.json({
    success: true,
    message: result.message
  })
}))

// Get all registered clusters
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: memoryStore.clusters
  })
}))

export default router
