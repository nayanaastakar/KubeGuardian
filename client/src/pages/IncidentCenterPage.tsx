import { useState } from 'react'
import { Activity, AlertTriangle, ListChecks } from 'lucide-react'
import { incidents } from '../services/mockApi'

export function IncidentCenterPage() {
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Incident Center</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Active alerts and remediation timeline</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
            <Activity className="h-5 w-5 text-cyan-400" /> Incident timeline active
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <h2 className="mb-4 text-xl font-semibold text-white">Open incidents</h2>
          <div className="space-y-4">
            {incidents.map((incident) => {
              const isExpanded = expandedIncidentId === incident.id
              return (
                <div
                  key={incident.id}
                  className={`rounded-3xl bg-slate-950/80 p-5 transition ${isExpanded ? 'ring-1 ring-sky-500/40 bg-slate-900/95' : 'cursor-pointer hover:bg-slate-900/80'}`}
                  onClick={() => setExpandedIncidentId(isExpanded ? null : incident.id)}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{incident.severity}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{incident.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">{incident.summary}</p>
                    </div>
                    <div className="flex flex-col items-start gap-3 text-right sm:items-end">
                      <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-rose-300">
                        {incident.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedIncidentId(isExpanded ? null : incident.id)}
                        className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                      >
                        {isExpanded ? 'Close incident' : 'Open incident'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                    <span className="rounded-2xl bg-slate-900/80 px-3 py-2">Affected: {incident.affected.join(', ')}</span>
                    <span className="rounded-2xl bg-slate-900/80 px-3 py-2">Started: {new Date(incident.startedAt).toLocaleString()}</span>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 space-y-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 text-sm text-slate-300">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Details</p>
                        <p className="mt-3 text-slate-300">This incident is being tracked with a remediation workflow and event timeline. Click again to collapse.</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Steps followed</p>
                        <ol className="mt-3 space-y-2 pl-5 text-slate-300">
                          <li>Detected crashloop using pod health metrics and alert correlation.</li>
                          <li>Validated memory exhaustion on the target service and isolated the pod.</li>
                          <li>Restarted the failing payment-service pod and monitored recovery.</li>
                          <li>Confirmed stable replica count and service availability after remediation.</li>
                        </ol>
                      </div>
                      <button
                        type="button"
                        className="btn-primary mt-4 w-full"
                      >
                        Acknowledge incident
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <h2 className="mb-4 text-xl font-semibold text-white">Remediation timeline</h2>
          <div className="space-y-5">
            <div className="rounded-3xl bg-slate-950/80 p-5">
              <div className="flex items-center gap-3 text-slate-200">
                <ListChecks className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold">Self-healing simulation</h3>
              </div>
              <div className="mt-4 space-y-3 text-slate-300">
                <p>• Pod restart triggered automatically for payments-service.</p>
                <p>• Deployment rollback initiated after failed-scale event.</p>
                <p>• Recovery completed in 5m 18s with zero data loss.</p>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-5">
              <div className="flex items-center gap-3 text-slate-200">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-semibold">Alert synthesis</h3>
              </div>
              <div className="mt-4 space-y-3 text-slate-300">
                <p>• High CPU spike detected for edge cluster.</p>
                <p>• Alert severity adjusted from medium to high based on anomaly scoring.</p>
                <p>• Suggested action: throttle noisy pod and scale replica set.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
