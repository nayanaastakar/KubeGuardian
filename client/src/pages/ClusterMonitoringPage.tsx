import { Monitor, Cpu, Server, Layers } from 'lucide-react'
import { clusterList, overviewData } from '../services/mockApi'
import { TrendChart } from '../components/charts/TrendChart'

export function ClusterMonitoringPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Cluster Monitoring</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Live node and pod telemetry</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
            <Monitor className="h-5 w-5 text-cyan-400" /> Real-time metrics streaming
          </span>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-6 flex items-center gap-3 text-slate-200">
            <Server className="h-5 w-5 text-cyan-400" />
            <span className="font-semibold">Clusters</span>
          </div>
          <div className="space-y-4">
            {clusterList.map((cluster) => (
              <div key={cluster.id} className="rounded-3xl bg-slate-950/80 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{cluster.name}</p>
                    <p className="text-lg font-semibold text-white">{cluster.pods} pods</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
                    {cluster.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                    Namespaces
                    <div className="mt-2 text-white">{cluster.namespaces}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                    Restarts
                    <div className="mt-2 text-white">{cluster.restarts}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-4 flex items-center gap-3 text-slate-200">
            <Cpu className="h-5 w-5 text-cyan-400" />
            <span className="font-semibold">Cluster Health</span>
          </div>
          <TrendChart data={overviewData.cpuSeries} title="Node CPU trend" color="#38bdf8" />
        </div>

        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-4 flex items-center gap-3 text-slate-200">
            <Layers className="h-5 w-5 text-cyan-400" />
            <span className="font-semibold">Workloads</span>
          </div>
          <TrendChart data={overviewData.memorySeries} title="Memory pressure" color="#818cf8" />
        </div>
      </section>
    </div>
  )
}
