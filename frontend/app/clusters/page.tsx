'use client'

import { Server, Activity, Cpu, HardDrive, Plus, X, Loader2, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function ClustersPage() {
  const [mounted, setMounted] = useState(false)
  const [clusters, setClusters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', apiUrl: '', token: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchClusters()
  }, [])

  const fetchClusters = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/clusters', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setClusters(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch clusters', error)
      toast.error('Failed to load clusters')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCluster = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/clusters', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        setClusters(prev => [...prev, data.data])
        setIsModalOpen(false)
        setFormData({ name: '', apiUrl: '', token: '' })
        toast.success('Cluster added successfully')
      } else {
        toast.error(data.error || 'Failed to add cluster')
      }
    } catch (error) {
      toast.error('Connection error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Clusters</h1>
            <p className="text-muted-foreground mt-2">Manage your connected Kubernetes clusters across all environments.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchClusters}
              disabled={loading}
              className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Cluster
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clusters</CardTitle>
              <Server className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clusters.length}</div>
            </CardContent>
          </Card>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clusters.reduce((acc, curr) => acc + (curr.nodes || curr.nodeCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg CPU</CardTitle>
              <Cpu className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48%</div>
            </CardContent>
          </Card>
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Memory</CardTitle>
              <HardDrive className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">61%</div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-effect shadow-md border-0">
          <CardHeader>
            <CardTitle>Connected Clusters</CardTitle>
            <CardDescription>View status and resource usage of all connected clusters.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-500 mt-2">Fetching cluster status...</p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cluster Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>K8s Version</TableHead>
                  <TableHead>Nodes</TableHead>
                  <TableHead>CPU Usage</TableHead>
                  <TableHead>Memory Usage</TableHead>
                  <TableHead>Last Sync</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clusters.map((cluster) => (
                  <TableRow key={cluster._id || cluster.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <TableCell className="font-medium text-white">{cluster.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        cluster.status === 'healthy' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200' 
                          : cluster.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200'
                      }>
                        {cluster.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{cluster.version || 'v1.28.0'}</TableCell>
                    <TableCell className="text-slate-300">{cluster.nodes || cluster.nodeCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${ (cluster.cpuUsage || 45) > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${cluster.cpuUsage || 45}%` }}></div>
                        </div>
                        <span className="text-xs text-slate-400">{cluster.cpuUsage || 45}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${ (cluster.memoryUsage || 62) > 80 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${cluster.memoryUsage || 62}%` }}></div>
                        </div>
                        <span className="text-xs text-slate-400">{cluster.memoryUsage || 62}%</span>
                      </div>
                    </TableCell>
                     <TableCell className="text-muted-foreground text-xs">{cluster.lastSync && mounted ? new Date(cluster.lastSync).toLocaleString() : cluster.lastSync ? '...' : 'Just now'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Cluster Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <Card className="w-full max-w-md glass-effect border-white/20 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-white">Connect New Cluster</CardTitle>
                  <CardDescription className="text-slate-400">Add your Kubernetes cluster details.</CardDescription>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCluster} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Cluster Name</label>
                    <Input 
                      required
                      placeholder="production-us-west"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Kubernetes API URL</label>
                    <Input 
                      required
                      placeholder="https://your-k8s-api.com"
                      value={formData.apiUrl}
                      onChange={e => setFormData({...formData, apiUrl: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Auth Token / Kubeconfig</label>
                    <Input 
                      required
                      type="password"
                      placeholder="Your secret token..."
                      value={formData.token}
                      onChange={e => setFormData({...formData, token: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Add Cluster
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
