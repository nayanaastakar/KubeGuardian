'use client'

import { 
  Server, 
  Shield, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getSeverityColor, getStatusColor, formatBytes } from '@/lib/utils'

export function OverviewDashboard() {
  // Mock data - will be replaced with API calls
  const stats = {
    totalClusters: 5,
    healthyClusters: 4,
    totalVulnerabilities: 23,
    criticalVulnerabilities: 2,
    activeAlerts: 8,
    resolvedToday: 15,
    cpuUsage: 67,
    memoryUsage: 72,
    storageUsage: 45
  }

  const recentVulnerabilities = [
    {
      id: '1',
      title: 'CVE-2023-1234: Remote Code Execution in nginx',
      severity: 'critical',
      cluster: 'production-cluster',
      discoveredAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Outdated OpenSSL version detected',
      severity: 'high',
      cluster: 'staging-cluster',
      discoveredAt: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      title: 'Privileged container detected',
      severity: 'medium',
      cluster: 'production-cluster',
      discoveredAt: '2024-01-15T08:45:00Z'
    }
  ]

  const recentAlerts = [
    {
      id: '1',
      title: 'High CPU usage on web-server pod',
      severity: 'high',
      cluster: 'production-cluster',
      status: 'active',
      createdAt: '2024-01-15T11:00:00Z'
    },
    {
      id: '2',
      title: 'Memory leak detected in database pod',
      severity: 'critical',
      cluster: 'production-cluster',
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '3',
      title: 'Failed deployment to staging',
      severity: 'medium',
      cluster: 'staging-cluster',
      status: 'resolved',
      createdAt: '2024-01-15T09:00:00Z'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Security Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor your Kubernetes clusters and security posture
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clusters</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClusters}</div>
            <p className="text-xs text-muted-foreground">
              {stats.healthyClusters} healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVulnerabilities}</div>
            <p className="text-xs text-red-600">
              {stats.criticalVulnerabilities} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.resolvedToday} resolved today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cpuUsage}%</div>
            <p className="text-xs text-muted-foreground">
              CPU • Memory {stats.memoryUsage}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vulnerabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recent Vulnerabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVulnerabilities.map((vuln) => (
                <div key={vuln.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {vuln.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getSeverityColor(vuln.severity)}>
                        {vuln.severity}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {vuln.cluster}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {new Date(vuln.discoveredAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View All Vulnerabilities
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    alert.status === 'active' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {alert.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {alert.cluster}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {new Date(alert.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resource Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-gray-600">{stats.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.cpuUsage}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-gray-600">{stats.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.memoryUsage}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-gray-600">{stats.storageUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${stats.storageUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
