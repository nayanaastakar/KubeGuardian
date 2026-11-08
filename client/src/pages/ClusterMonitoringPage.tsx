import { useEffect, useState } from 'react'
import { Monitor, Cpu, Server, Layers, Filter, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { getLiveClusterStats, getClusterPods, getMetricsSummary, remediatePod } from '../services/api'
import { TrendChart } from '../components/charts/TrendChart'
import { useNotificationsStore } from '../store/notificationsStore'

export function ClusterMonitoringPage() {
  const addNotification = useNotificationsStore((state) => state.addNotification)
  const [clusters, setClusters] = useState<any[]>([])
  const [pods, setPods] = useState<any[]>([])
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all')
  const [cpuSeries, setCpuSeries] = useState<any[]>([])
  const [memorySeries, setMemorySeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [remediating, setRemediating] = useState<Record<string, boolean>>({})

  const fetchData = async () => {
    try {
      const [clusterRes, podsRes, metricsRes] = await Promise.all([
        getLiveClusterStats().catch(() => null),
        getClusterPods(selectedNamespace === 'all' ? undefined : selectedNamespace).catch(() => null),
        getMetricsSummary().catch(() => null)
      ])

      if (clusterRes?.data?.data) {
        setClusters(clusterRes.data.data)
      }
      if (podsRes?.data?.data) {
        setPods(podsRes.data.data)
      }
      if (metricsRes?.data?.data) {
        setCpuSeries(metricsRes.data.data.cpuSeries || [])
        setMemorySeries(metricsRes.data.data.memorySeries || [])
      }
    } catch (error) {
      console.error('Failed to fetch cluster telemetry:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [selectedNamespace])

  const handleRestart = async (namespace: string, podName: string) => {
    setRemediating(prev => ({ ...prev, [podName]: true }))
    try {
      const res = await remediatePod(namespace, podName)
      addNotification({
        type: 'success',
        title: 'Pod Restart Initiated',
        message: res.data?.message || `Pod ${podName} restarted successfully.`
      })
      setTimeout(fetchData, 1500)
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Remediation Failed',
        message: err.response?.data?.error || err.message
      })
    } finally {
      setRemediating(prev => ({ ...prev, [podName]: false }))
    }
  }

  const namespaces = ['all', 'production', 'ingress-nginx', 'logging', 'dev-ops', 'default']

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Cluster Monitoring</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Live Node & Pod Telemetry</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 transition"
            >
              <RefreshCw className="h-4 w-4 text-cyan-400" />
              Sync Cluster
            </button>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
              <Monitor className="h-5 w-5 text-cyan-400" /> Real-time Metrics
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-6 flex items-center gap-3 text-slate-200">
            <Server className="h-5 w-5 text-cyan-400" />
            <span className="font-semibold">Active Cluster</span>
          </div>
          <div className="space-y-4">
            {clusters.map((cluster) => (
              <div key={cluster.id} className="rounded-3xl bg-slate-950/80 p-4 border border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{cluster.name}</p>
                    <p className="text-lg font-semibold text-white">{cluster.pods} pods</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    cluster.status === 'Healthy' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                  }`}>
                    {cluster.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                    <p className="text-xs text-slate-400">Namespaces</p>
                    <div className="mt-1 text-base font-medium text-white">{cluster.namespaces}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                    <p className="text-xs text-slate-400">Restarts Total</p>
                    <div className="mt-1 text-base font-medium text-white">{cluster.restarts}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-4 flex items-center gap-3 text-slate-200">
            <Cpu className="h-5 w-5 text-cyan-400" />
            <span className="font-semibold">Cluster CPU Utilization</span>
          </div>
          <TrendChart data={cpuSeries} title="Node CPU trend" color="#38bdf8" />
        </div>

        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-4 flex items-center gap-3 text-slate-200">
            <Layers className="h-5 w-5 text-cyan-400" />
            <span className="font-semibold">Cluster Memory Pressure</span>
          </div>
          <TrendChart data={memorySeries} title="Memory pressure" color="#818cf8" />
        </div>
      </section>

      {/* Pods Table with Namespace Filter */}
      <section className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Workload Pods</h2>
            <p className="text-sm text-slate-400">Real-time pod lifecycle states and container resource limits</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            {namespaces.map((ns) => (
              <button
                key={ns}
                onClick={() => setSelectedNamespace(ns)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
                  selectedNamespace === ns
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-950/60'
                }`}
              >
                {ns}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Pod Name</th>
                <th className="px-4 py-3">Namespace</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Restarts</th>
                <th className="px-4 py-3">Memory Limit</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {pods.map((pod) => {
                const isCrash = pod.status === 'CrashLoopBackOff' || pod.restarts > 5
                return (
                  <tr key={pod.name} className="border-b border-slate-800/60 hover:bg-slate-950/70">
                    <td className="px-4 py-3.5 font-medium text-white">{pod.name}</td>
                    <td className="px-4 py-3.5 text-slate-400">{pod.namespace}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        pod.ready ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                      }`}>
                        {pod.ready ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {pod.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">{pod.restarts}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">{pod.memoryLimit}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleRestart(pod.namespace, pod.name)}
                        disabled={remediating[pod.name]}
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
                      >
                        {remediating[pod.name] ? 'Restarting...' : 'Restart Pod'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
