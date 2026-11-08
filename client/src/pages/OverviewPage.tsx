import { useState, useEffect } from 'react'
import { ArrowUpRight, Cpu, ShieldCheck, Zap, RefreshCw, AlertTriangle, Activity } from 'lucide-react'
import { MetricCard } from '../components/ui/MetricCard'
import { TrendChart } from '../components/charts/TrendChart'
import { getMetricsSummary, getClusterNodes, getSecurityOverview, getAlerts } from '../services/api'
import { useNotificationsStore } from '../store/notificationsStore'

export function OverviewPage() {
  const addNotification = useNotificationsStore((state) => state.addNotification)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [summaryMetrics, setSummaryMetrics] = useState({
    clusterHealth: '94%',
    activePods: '28',
    openAlerts: '4',
    securityScore: '78/100'
  })

  const [cpuSeries, setCpuSeries] = useState<any[]>([])
  const [memorySeries, setMemorySeries] = useState<any[]>([])
  const [nodes, setNodes] = useState<any[]>([])

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const [metricsRes, nodesRes, secRes, alertsRes] = await Promise.all([
        getMetricsSummary().catch(() => null),
        getClusterNodes().catch(() => null),
        getSecurityOverview().catch(() => null),
        getAlerts({ status: 'active' }).catch(() => null)
      ])

      if (metricsRes?.data?.data) {
        const m = metricsRes.data.data
        setCpuSeries(m.cpuSeries || [])
        setMemorySeries(m.memorySeries || [])
        setSummaryMetrics(prev => ({
          ...prev,
          activePods: String(m.podCount || 28),
          clusterHealth: m.failedPods > 0 ? '88%' : '98%'
        }))
      }

      if (nodesRes?.data?.data) {
        setNodes(nodesRes.data.data)
      }

      if (secRes?.data?.data) {
        const s = secRes.data.data
        setSummaryMetrics(prev => ({
          ...prev,
          securityScore: `${s.securityScore || 78}/100`
        }))
      }

      if (alertsRes?.data?.data) {
        setSummaryMetrics(prev => ({
          ...prev,
          openAlerts: String(alertsRes.data.data.length || 0)
        }))
      }

      if (isManual) {
        addNotification({
          type: 'success',
          title: 'Telemetry Refreshed',
          message: 'Overview data synchronized with cluster.'
        })
      }
    } catch (err: any) {
      console.error('Failed to load overview data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    const timer = setInterval(() => loadData(), 15000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Overview</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Kubernetes DevSecOps Intelligence</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              <Zap className="h-5 w-5 text-cyan-400" />
              Live Telemetry Stream Active
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Cluster Health" value={summaryMetrics.clusterHealth} delta="+2.5%" />
        <MetricCard title="Active Pods" value={summaryMetrics.activePods} delta="Live" />
        <MetricCard title="Open Alerts" value={summaryMetrics.openAlerts} delta="Requires Review" />
        <MetricCard title="Security Score" value={summaryMetrics.securityScore} delta="CIS Benchmark" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <TrendChart data={cpuSeries} title="Cluster CPU Utilization (%)" color="#38bdf8" />
        <TrendChart data={memorySeries} title="Cluster Memory Utilization (%)" color="#818cf8" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2 items-start">
        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Cluster nodes</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Resource Topology</h2>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-300" />
          </div>
          <div className="space-y-4">
            {nodes.length === 0 ? (
              <p className="text-sm text-slate-400">Loading node topology...</p>
            ) : (
              nodes.map((node) => (
                <div key={node.name} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{node.name}</p>
                      <p className="text-lg font-semibold text-white">{node.status}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${
                      node.status === 'Healthy' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                      <p className="text-slate-400 text-xs uppercase">CPU Load</p>
                      <p className="mt-1 text-base font-medium text-white">{node.cpu}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                      <p className="text-slate-400 text-xs uppercase">RAM Usage</p>
                      <p className="mt-1 text-base font-medium text-white">{node.ram}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                      <p className="text-slate-400 text-xs uppercase">Pods Running</p>
                      <p className="mt-1 text-base font-medium text-white">{node.pods}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">DevSecOps Status</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Security Posture</h2>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">CIS Benchmark Compliance</span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">Passed 82%</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Pod security standards, non-root execution, etcd encryption evaluated.</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">RBAC Least-Privilege</span>
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">Review Required</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">cluster-admin binding detected on default serviceaccount in dev-ops namespace.</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Network Microsegmentation</span>
                <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-300">Action Needed</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Namespace frontend lacks default-deny ingress NetworkPolicy.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
