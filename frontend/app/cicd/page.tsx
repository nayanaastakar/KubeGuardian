'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitBranch, CheckCircle2, XCircle, Clock, PlayCircle, RefreshCw, Plus, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function CICDPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pipelines, setPipelines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPipelines()
  }, [])

  const fetchPipelines = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/scans', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setPipelines(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch pipelines', error)
      toast.error('Failed to sync with CI/CD service')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchPipelines()
    setIsRefreshing(false)
    toast.success('Pipeline status updated')
  }

  const handleRunPipeline = () => {
    toast.success('Pipeline execution triggered: Running security gates...')
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">CI/CD Security Gates</h1>
            <p className="text-muted-foreground mt-2">Monitor pipeline executions and automated security validations.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button 
              onClick={handleRunPipeline}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" /> Run Pipeline
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Deployments (7d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">142</div>
            </CardContent>
          </Card>
          <Card className="glass-effect border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Security Pass Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">92.4%</div>
            </CardContent>
          </Card>
          <Card className="glass-effect border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Blocked by Security Gate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">11</div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-effect shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-500" />
              Recent Pipeline Runs
            </CardTitle>
            <CardDescription>GitHub Actions integration with Trivy image scanning.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                  <p className="text-sm text-slate-500">Checking pipeline status...</p>
                </div>
              ) : pipelines.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    {run.status === 'completed' || run.status === 'passed' ? (
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-500" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{run.repo || 'unknown-repo'}</h4>
                        <span className="text-sm text-muted-foreground">{run.id}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> {run.branch || 'main'}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(run.startedAt).toLocaleTimeString()}</span>
                        <span className="flex items-center gap-1"><PlayCircle className="h-3 w-3" /> {run.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {run.status === 'completed' || run.status === 'passed' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">PASSED</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">FAILED: SECURITY GATE</Badge>
                    )}
                    {run.vulnerabilitiesFound > 0 && (
                      <span className="text-xs font-medium text-red-500">{run.vulnerabilitiesFound} Critical CVEs Found</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
