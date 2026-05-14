import { ShieldCheck, TrendingUp } from 'lucide-react'
import { securityScores } from '../services/mockApi'
import { TrendChart } from '../components/charts/TrendChart'

export function SecurityScoringPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Security Score</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Risk posture and hardening guidance</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
            <ShieldCheck className="h-5 w-5 text-emerald-400" /> Stable score trends
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Cluster</p>
          <p className="mt-4 text-5xl font-semibold text-white">{securityScores.cluster}/100</p>
          <p className="mt-3 text-sm text-slate-300">Overall security rating for the cluster.</p>
        </div>
        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Namespace</p>
          <p className="mt-4 text-5xl font-semibold text-white">{securityScores.namespace}/100</p>
          <p className="mt-3 text-sm text-slate-300">Average namespace hardening score.</p>
        </div>
        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Deployment</p>
          <p className="mt-4 text-5xl font-semibold text-white">{securityScores.deployment}/100</p>
          <p className="mt-3 text-sm text-slate-300">Deployment-level security posture.</p>
        </div>
      </section>

      <section className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
        <div className="mb-5 flex items-center gap-3 text-slate-200">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h2 className="text-xl font-semibold">Security score trend</h2>
        </div>
        <TrendChart data={securityScores.trends.map(t => ({ ...t, value: t.score }))} title="Weekly score progression" color="#22c55e" />
      </section>
    </div>
  )
}
