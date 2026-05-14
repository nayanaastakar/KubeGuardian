import { ArrowUpRight, Cpu, ShieldCheck, TrendingUp, Zap } from 'lucide-react'
import { MetricCard } from '../components/ui/MetricCard'
import { TrendChart } from '../components/charts/TrendChart'
import { overviewData } from '../services/mockApi'
import { useNotificationsStore } from '../store/notificationsStore'

export function OverviewPage() {
  const addNotification = useNotificationsStore((state) => state.addNotification)

  const testNotifications = () => {
    const notifications = [
      { type: 'success' as const, title: 'Test Success', message: 'This is a success notification with sound and browser alert' },
      { type: 'warning' as const, title: 'Test Warning', message: 'This is a warning notification' },
      { type: 'error' as const, title: 'Test Error', message: 'This is an error notification' },
      { type: 'info' as const, title: 'Test Info', message: 'This is an info notification' }
    ]

    notifications.forEach((notif, index) => {
      setTimeout(() => addNotification(notif), index * 1000)
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Overview</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Kubernetes operational intelligence</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={testNotifications}
              className="inline-flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <Zap className="h-5 w-5 text-cyan-400" />
              Test Notifications
            </button>
            <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              <Zap className="h-5 w-5 text-cyan-400" />
              Predictive failure detection is active
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewData.summary.map((item) => (
          <MetricCard key={item.label} title={item.label} value={item.value} delta={item.delta} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <TrendChart data={overviewData.cpuSeries} title="CPU utilization" color="#38bdf8" />
        <TrendChart data={overviewData.memorySeries} title="Memory utilization" color="#818cf8" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Cluster nodes</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Resource topology</h2>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-300" />
          </div>
          <div className="space-y-4">
            {overviewData.nodes.map((node) => (
              <div key={node.name} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{node.name}</p>
                    <p className="text-lg font-semibold text-white">{node.status}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                    {node.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                    <p>CPU</p>
                    <p className="mt-2 text-white">{node.cpu}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                    <p>RAM</p>
                    <p className="mt-2 text-white">{node.ram}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                    <p>Pods</p>
                    <p className="mt-2 text-white">{node.pods}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Operational insights</p>
              <h2 className="mt-2 text-xl font-semibold text-white">AI-driven recommendations</h2>
            </div>
            <ShieldCheck className="h-5 w-5 text-slate-300" />
          </div>
          <div className="space-y-4 text-slate-300">
            <p>• KubeGuardian predicts a 78% likelihood of pod crash in the payments namespace within 30 minutes.</p>
            <p>• Recommended remediation: restart deployment and enforce memory limits.</p>
            <p>• Risk rating: <span className="text-cyan-300">Moderate</span>.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
