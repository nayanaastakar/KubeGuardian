'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, ShieldAlert, CheckCircle, Activity, RefreshCw, Loader2, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function SecurityPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const [eventsRes, statsRes] = await Promise.all([
        fetch('/api/alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/security/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]).catch(err => {
        throw new Error('Backend services unavailable')
      })

      const eventsData = await eventsRes.json()
      const statsData = await statsRes.json()

      if (eventsData.success) setEvents(eventsData.data)
      if (statsData.success) setStats(statsData.data)
    } catch (error) {
      console.error('Failed to fetch security data', error)
      toast.error('Security backend unreachable. Showing local fallback.')
      // Fallback to mock if API fails
      setEvents([
        { _id: '1', type: 'Pod Exec', description: 'Unauthorized exec into prod-db-0', severity: 'critical', createdAt: new Date().toISOString(), clusterId: { name: 'production-us-east-1' } },
        { _id: '2', type: 'Network', description: 'Suspicious outbound connection', severity: 'high', createdAt: new Date(Date.now() - 3600000).toISOString(), clusterId: { name: 'production-us-east-1' } },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSecurityData()
    setIsRefreshing(false)
    toast.success('Security events updated')
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Security Posture</h1>
            <p className="text-muted-foreground mt-2">Real-time threat detection and security analytics across your infrastructure.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-effect bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-gray-900 border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-400">Critical Threats</CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats?.criticalVulnerabilities || 3}</div>
              <p className="text-xs text-red-500 mt-1">Requiring immediate action</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">High Risks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats?.highVulnerabilities || 12}</div>
              <p className="text-xs text-orange-500 mt-1">Based on latest scans</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.securityScore || 85}/100</div>
              <p className="text-xs text-green-500 mt-1">Platform health index</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Vulnerabilities</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.totalVulnerabilities || 42}</div>
              <p className="text-xs text-blue-500 mt-1">Across all namespaces</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-effect shadow-md border-0 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Security Events
              </CardTitle>
              <CardDescription>Real-time alerts generated by Falco runtime security.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-xs">Analyzing security events...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map(event => (
                    <div key={event._id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700">
                      <div className={`mt-0.5 rounded-full p-2 ${
                        event.severity === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                        event.severity === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                      }`}>
                        {event.severity === 'critical' ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{event.type}</p>
                          <span className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] uppercase">{event.clusterId?.name || 'All Clusters'}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect shadow-md border-0 h-full">
            <CardHeader>
              <CardTitle>Top At-Risk Resources</CardTitle>
              <CardDescription>Namespaces and workloads with the highest security risks.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">namespace: default</span>
                    <span className="text-red-500 font-bold">High Risk</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">deployment: payments-service</span>
                    <span className="text-orange-500 font-bold">Medium-High</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">namespace: kube-system</span>
                    <span className="text-yellow-500 font-bold">Medium Risk</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
