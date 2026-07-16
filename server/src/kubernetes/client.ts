import * as k8s from '@kubernetes/client-node'
import { logger } from '@/utils/logger'

let kc: k8s.KubeConfig
let k8sApi: k8s.CoreV1Api
let appsApi: k8s.AppsV1Api
let networkingApi: k8s.NetworkingV1Api

export async function setupKubernetesClient() {
  try {
    // Load kubeconfig from default location or environment
    kc = new k8s.KubeConfig()
    
    if (process.env.KUBECONFIG_PATH) {
      kc.loadFromFile(process.env.KUBECONFIG_PATH)
    } else {
      kc.loadFromDefault()
    }

    // Create API clients
    k8sApi = kc.makeApiClient(k8s.CoreV1Api)
    appsApi = kc.makeApiClient(k8s.AppsV1Api)
    networkingApi = kc.makeApiClient(k8s.NetworkingV1Api)

    // Test connection
    const versionApi = kc.makeApiClient(k8s.VersionApi)
    const clusterInfo = await versionApi.getCode()
    logger.info('✅ Kubernetes client initialized successfully')
    logger.info(`Cluster API version: ${clusterInfo.body.gitVersion}`)

    return { kc, k8sApi, appsApi, networkingApi }
  } catch (error) {
    logger.error('❌ Failed to initialize Kubernetes client:', error)
    throw error
  }
}

export function getKubernetesClients() {
  if (!k8sApi) {
    throw new Error('Kubernetes client not initialized. Call setupKubernetesClient() first.')
  }
  return { kc, k8sApi, appsApi, networkingApi }
}

// Health check
export async function checkKubernetesHealth() {
  try {
    if (!k8sApi) {
      return { status: 'unhealthy', error: 'Client not initialized' }
    }

    const versionApi = kc.makeApiClient(k8s.VersionApi)
    const response = await versionApi.getCode()
    return { 
      status: 'healthy', 
      apiVersion: response.body.gitVersion,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    logger.error('Kubernetes health check failed:', error)
    return { status: 'unhealthy', error: error.message }
  }
}

// Get cluster info
export async function getClusterInfo() {
  try {
    if (!k8sApi) {
      throw new Error('Kubernetes client not initialized')
    }

    const versionApi = kc.makeApiClient(k8s.VersionApi)
    const [versionResponse, nodesResponse] = await Promise.all([
      versionApi.getCode(),
      k8sApi.listNode()
    ])

    return {
      version: versionResponse.body,
      nodes: nodesResponse.body.items,
      nodeCount: nodesResponse.body.items?.length || 0
    }
  } catch (error) {
    logger.error('Failed to get cluster info:', error)
    throw error
  }
}

// Get namespaces
export async function getNamespaces() {
  try {
    if (!k8sApi) {
      throw new Error('Kubernetes client not initialized')
    }

    const response = await k8sApi.listNamespace()
    return response.body.items || []
  } catch (error) {
    logger.error('Failed to get namespaces:', error)
    throw error
  }
}

// Get pods in namespace
export async function getPods(namespace: string = 'default') {
  try {
    if (!k8sApi) {
      throw new Error('Kubernetes client not initialized')
    }

    const response = await k8sApi.listNamespacedPod(namespace)
    return response.body.items || []
  } catch (error) {
    logger.error(`Failed to get pods in namespace ${namespace}:`, error)
    throw error
  }
}

// Get deployments in namespace
export async function getDeployments(namespace: string = 'default') {
  try {
    if (!appsApi) {
      throw new Error('Kubernetes client not initialized')
    }

    const response = await appsApi.listNamespacedDeployment(namespace)
    return response.body.items || []
  } catch (error) {
    logger.error(`Failed to get deployments in namespace ${namespace}:`, error)
    throw error
  }
}
