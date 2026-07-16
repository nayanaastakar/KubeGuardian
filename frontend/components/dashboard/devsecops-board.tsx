'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  Server,
  AlertTriangle,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Zap,
  ShieldAlert,
  GitBranch,
  Eye,
  RefreshCw,
  FolderKanban,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useProjectStore } from '@/store/projectStore'

/* ─── Mock Data ─────────────────────────────────────────── */
const clusters = [
  { name: 'production-us-east-1', status: 'healthy', nodes: 12, pods: 247, cpu: 45, memory: 62, version: 'v1.28.3' },
  { name: 'staging-us-east-1', status: 'warning', nodes: 4, pods: 68, cpu: 85, memory: 91, version: 'v1.27.5' },
  { name: 'dev-eu-west-1', status: 'healthy', nodes: 2, pods: 31, cpu: 15, memory: 30, version: 'v1.28.3' },
]

const recentAlerts = [
  { id: 1, severity: 'critical', title: 'Unauthorized pod exec in prod-db-0', cluster: 'production-us-east-1', time: '2 min ago' },
  { id: 2, severity: 'high', title: 'Outbound connection to mining pool detected', cluster: 'production-us-east-1', time: '1 hr ago' },
  { id: 3, severity: 'high', title: 'ClusterRoleBinding with cluster-admin created', cluster: 'staging-us-east-1', time: '3 hrs ago' },
  { id: 4, severity: 'medium', title: 'Image with critical CVE deployed', cluster: 'dev-eu-west-1', time: '5 hrs ago' },
]

const cicdPipelines = [
  { name: 'payments-service', branch: 'main', status: 'success', duration: '4m 12s', ago: '10 min ago' },
  { name: 'auth-service', branch: 'release/v2.3', status: 'running', duration: '2m 05s', ago: 'Running now' },
  { name: 'api-gateway', branch: 'feat/rate-limit', status: 'failed', duration: '1m 47s', ago: '45 min ago' },
  { name: 'frontend', branch: 'main', status: 'success', duration: '6m 58s', ago: '1 hr ago' },
]

const topVulnerabilities = [
  { cve: 'CVE-2024-3094', cvss: 10.0, package: 'liblzma5', affected: 3, status: 'critical' },
  { cve: 'CVE-2024-21626', cvss: 8.6, package: 'runc', affected: 12, status: 'high' },
  { cve: 'CVE-2023-44487', cvss: 7.5, package: 'golang.org/x/net', affected: 5, status: 'high' },
  { cve: 'CVE-2024-1234', cvss: 6.5, package: 'openssl', affected: 8, status: 'medium' },
]

/* ─── Helper Components ─────────────────────────────────── */
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  trend,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  colorClass: string
  trend?: { direction: 'up' | 'down'; label: string; positive?: boolean }
}) {
  return (
    <Card className={`kg-card ${colorClass}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
            <div className="text-3xl font-bold text-white mt-1">{value}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5">
            <Icon className="w-5 h-5 text-slate-300" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <>
              {trend.direction === 'up' ? (
                <TrendingUp className={`w-3.5 h-3.5 ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`} />
              ) : (
                <TrendingDown className={`w-3.5 h-3.5 ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`} />
              )}
              <span className={`text-xs font-medium ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend.label}
              </span>
              <span className="text-xs text-slate-500">vs yesterday</span>
            </>
          )}
          {!trend && <span className="text-xs text-slate-500">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-300 border border-red-500/30',
    high: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    low: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[severity] ?? map.low}`}>
      {severity}
    </span>
  )
}

function PipelineStatus({ status }: { status: string }) {
  if (status === 'success') return (
    <div className="flex items-center gap-1.5">
      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
      <span className="text-xs text-emerald-400 font-medium">Passed</span>
    </div>
  )
  if (status === 'failed') return (
    <div className="flex items-center gap-1.5">
      <XCircle className="w-3.5 h-3.5 text-red-400" />
      <span className="text-xs text-red-400 font-medium">Failed</span>
    </div>
  )
  return (
    <div className="flex items-center gap-1.5">
      <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
      <span className="text-xs text-blue-400 font-medium">Running</span>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
export function DevSecOpsBoard() {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { activeProject } = useProjectStore()

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setCurrentTime(new Date())
    }, 1000)
  }

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--kg-bg-primary)' }}>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security Command Center
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-sm text-slate-400">
              Real-time DevSecOps overview across all clusters
            </p>
            {activeProject && (
              <Link
                href="/projects"
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25 hover:bg-blue-500/25 transition-colors"
              >
                <FolderKanban className="w-3 h-3" />
                {activeProject.name}
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-mono">
              {mounted ? currentTime.toLocaleTimeString('en-US', { hour12: false }) : '00:00:00'}
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* ── KPI Metrics Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Security Score"
          value={activeProject ? `${activeProject.securityScore}/100` : '85/100'}
          subtitle="Good standing"
          icon={Shield}
          colorClass="metric-card-green"
          trend={{ direction: 'up', label: '+3 pts', positive: true }}
        />
        <MetricCard
          title="Active Threats"
          value={activeProject ? (activeProject.criticalVulnerabilities ?? 0) : 3}
          subtitle="Requires attention"
          icon={ShieldAlert}
          colorClass="metric-card-red"
          trend={{ direction: 'up', label: '+1 new', positive: false }}
        />
        <MetricCard
          title="Total Clusters"
          value={activeProject ? (activeProject.clusterCount ?? 0) : 3}
          subtitle="2 healthy, 1 warning"
          icon={Server}
          colorClass="metric-card-blue"
        />
        <MetricCard
          title="Vulnerabilities"
          value={activeProject ? (activeProject.totalVulnerabilities ?? 0) : 47}
          subtitle="Across all clusters"
          icon={AlertTriangle}
          colorClass="metric-card-orange"
          trend={{ direction: 'down', label: '-12 fixed', positive: true }}
        />
      </div>

      {/* ── Clusters + Alerts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Cluster Status */}
        <Card className="lg:col-span-3 kg-card">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Cluster Health
              </CardTitle>
              <Link href="/clusters" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" /> View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {clusters.map((cluster) => (
                <div key={cluster.name} className="px-5 py-4 hover:bg-white/3 transition-colors group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cluster.status === 'healthy' ? 'status-online' : 'status-warning'}
                        style={{ width: 8, height: 8 }}
                      />
                      <span className="text-sm font-medium text-white">{cluster.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{cluster.version}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        cluster.status === 'healthy'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      }`}>
                        {cluster.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                        <span className={cluster.cpu > 80 ? 'text-red-400' : 'text-slate-300'}>{cluster.cpu}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className={`progress-bar-fill ${cluster.cpu > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${cluster.cpu}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 flex items-center gap-1"><HardDrive className="w-3 h-3" /> MEM</span>
                        <span className={cluster.memory > 85 ? 'text-red-400' : 'text-slate-300'}>{cluster.memory}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className={`progress-bar-fill ${cluster.memory > 85 ? 'bg-red-500' : 'bg-violet-500'}`}
                          style={{ width: `${cluster.memory}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Server className="w-3 h-3 text-slate-500" />
                        <span>{cluster.nodes} nodes</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-slate-500" />
                        <span>{cluster.pods} pods</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="lg:col-span-2 kg-card">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Active Threats
              </CardTitle>
              <Link href="/security" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" /> View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <SeverityBadge severity={alert.severity} />
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{alert.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{alert.cluster}</span>
                  <span className="text-[10px] text-slate-600">{alert.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── CI/CD + Vulnerabilities Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CI/CD Pipelines */}
        <Card className="kg-card">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                CI/CD Pipelines
              </CardTitle>
              <Link href="/cicd" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" /> View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {cicdPipelines.map((pipeline, idx) => (
                <div key={idx} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{pipeline.name}</p>
                    <p className="text-[11px] text-slate-500">{pipeline.branch} · {pipeline.ago}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-600 font-mono">{pipeline.duration}</span>
                    <PipelineStatus status={pipeline.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Vulnerabilities */}
        <Card className="kg-card">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Critical CVEs
              </CardTitle>
              <Link href="/vulnerabilities" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" /> View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {topVulnerabilities.map((vuln, idx) => (
                <div key={idx} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-semibold text-white">{vuln.cve}</span>
                      <SeverityBadge severity={vuln.status} />
                    </div>
                    <p className="text-[11px] text-slate-500">{vuln.package}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold ${
                      vuln.cvss >= 9 ? 'text-red-400' : vuln.cvss >= 7 ? 'text-amber-400' : 'text-yellow-400'
                    }`}>
                      {vuln.cvss}
                    </div>
                    <div className="text-[10px] text-slate-600">{vuln.affected} images</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Compliance Summary ── */}
      <Card className="kg-card">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            Compliance &amp; Security Posture Summary
            {activeProject && (
              <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                <FolderKanban className="w-3 h-3" />{activeProject.name}
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            CIS Kubernetes Benchmark · NIST SP 800-190 · SOC 2 Type II
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'RBAC Policies', score: activeProject ? Math.min(100, (activeProject.complianceScore ?? 80) + 5) : 92, color: 'bg-emerald-500' },
              { label: 'Network Policies', score: activeProject ? (activeProject.complianceScore ?? 78) : 78, color: 'bg-blue-500' },
              { label: 'Image Security', score: activeProject ? Math.max(30, (activeProject.securityScore ?? 65) - 10) : 65, color: 'bg-amber-500' },
              { label: 'Runtime Security', score: activeProject ? Math.min(100, (activeProject.securityScore ?? 88) + 3) : 88, color: 'bg-violet-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className="text-xs font-bold text-white">{item.score}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className={`progress-bar-fill ${item.color}`} style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
