import { useState } from 'react'
import { AlertTriangle, Cpu, Shuffle } from 'lucide-react'
import { useNotificationsStore } from '../store/notificationsStore'
import { chaosScenarios } from '../services/mockApi'

export function ChaosEngineeringPage() {
  const addNotification = useNotificationsStore((state) => state.addNotification)
  const [runHistory, setRunHistory] = useState<Record<string, string[]>>({})
  const [scenarioStatus, setScenarioStatus] = useState<Record<string, string>>(
    chaosScenarios.reduce((acc, scenario) => ({ ...acc, [scenario.id]: scenario.status }), {} as Record<string, string>)
  )

  const runSimulation = (scenario: { id: string; name: string; impact: string }) => {
    const steps = [
      `Injected fault: ${scenario.name}`,
      `Observed response at impact level: ${scenario.impact}`,
      'Verified workload recovery and service availability.',
      'Captured resilience metrics and generated report.'
    ]

    setRunHistory((prev) => ({ ...prev, [scenario.id]: steps }))
    setScenarioStatus((prev) => ({ ...prev, [scenario.id]: 'Completed' }))
    addNotification({
      type: 'info',
      title: 'Chaos simulation complete',
      message: `${scenario.name} completed successfully.`
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Chaos Engineering</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Simulate resilience and self-healing</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
            <Shuffle className="h-5 w-5 text-cyan-400" /> Fault injection scenarios
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {chaosScenarios.map((scenario) => {
          const history = runHistory[scenario.id]
          return (
            <div key={scenario.id} className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{scenario.objective}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{scenario.name}</h2>
                </div>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300">{scenarioStatus[scenario.id]}</span>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>Impact: <span className="text-white">{scenario.impact}</span></p>
                <p>• Validate cluster repair after injected failure.</p>
                <p>• Monitor recovery speed and alert correlation.</p>
              </div>
              <button
                type="button"
                onClick={() => runSimulation(scenario)}
                className="btn-primary mt-6 w-full"
              >
                {history ? 'Run again' : 'Run simulation'}
              </button>

              {history && (
                <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-slate-300">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Steps followed</p>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                    {history.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
        <div className="flex items-center gap-3 text-slate-200">
          <Cpu className="h-5 w-5 text-emerald-400" />
          <h2 className="text-xl font-semibold">Resilience metrics</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-300">
            <p className="text-sm uppercase tracking-[0.35em]">Recovery speed</p>
            <p className="mt-3 text-3xl font-semibold text-white">5m 18s</p>
          </div>
          <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-300">
            <p className="text-sm uppercase tracking-[0.35em]">Success rate</p>
            <p className="mt-3 text-3xl font-semibold text-white">92%</p>
          </div>
          <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-300">
            <p className="text-sm uppercase tracking-[0.35em]">Detected issues</p>
            <p className="mt-3 text-3xl font-semibold text-white">8</p>
          </div>
        </div>
      </div>
    </div>
  )
}
