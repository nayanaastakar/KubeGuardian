import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, CheckCircle, XCircle, RotateCcw, ShieldAlert, Play, FileCode, Check } from 'lucide-react'
import { getAlerts, getRemediations, approveRemediation, rejectRemediation, executeRemediation, rollbackRemediation } from '../services/api'
import { useNotificationsStore } from '../store/notificationsStore'

export function IncidentCenterPage() {
  const addNotification = useNotificationsStore((state) => state.addNotification)
  const [alerts, setAlerts] = useState<any[]>([])
  const [remediations, setRemediations] = useState<any[]>([])
  const [selectedRemediation, setSelectedRemediation] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  const loadData = async () => {
    try {
      const [alertsRes, remRes] = await Promise.all([
        getAlerts().catch(() => null),
        getRemediations().catch(() => null)
      ])
      if (alertsRes?.data?.data) setAlerts(alertsRes.data.data)
      if (remRes?.data?.data) {
        setRemediations(remRes.data.data)
        if (!selectedRemediation && remRes.data.data.length > 0) {
          setSelectedRemediation(remRes.data.data[0])
        }
      }
    } catch (err) {
      console.error('Failed to load incident center data:', err)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleApproveAndExecute = async (rem: any) => {
    const id = rem._id || rem.remediationId
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      await approveRemediation(id)
      const execRes = await executeRemediation(id)
      addNotification({
        type: 'success',
        title: 'Remediation Executed Successfully',
        message: execRes.data?.message || 'Workload patched and restored.'
      })
      await loadData()
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Execution Failed',
        message: err.response?.data?.error || err.message
      })
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleReject = async (rem: any) => {
    const id = rem._id || rem.remediationId
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      await rejectRemediation(id, 'Rejected by operator.')
      addNotification({
        type: 'info',
        title: 'Remediation Rejected',
        message: `Proposal ${rem.remediationId} has been rejected.`
      })
      await loadData()
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: err.message
      })
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleRollback = async (rem: any) => {
    const id = rem._id || rem.remediationId
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      const res = await rollbackRemediation(id)
      addNotification({
        type: 'warning',
        title: 'Rollback Completed',
        message: res.data?.message || 'Configuration rolled back to previous baseline.'
      })
      await loadData()
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Rollback Failed',
        message: err.response?.data?.error || err.message
      })
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40'
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'executed':
        return 'bg-emerald-500/15 text-emerald-300'
      case 'pending_approval':
        return 'bg-amber-500/15 text-amber-300'
      case 'rejected':
        return 'bg-rose-500/15 text-rose-300'
      case 'rolled_back':
        return 'bg-purple-500/15 text-purple-300'
      default:
        return 'bg-slate-800 text-slate-300'
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Incident Center & Remediation</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Approval-Based Remediation & Alerts</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
            <Activity className="h-5 w-5 text-cyan-400" /> Human-in-the-Loop Safeguards Active
          </div>
        </div>
      </section>

      {/* Remediation Approval Workflow Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Remediation Proposals (Approval Required)</h2>
            <p className="text-sm text-slate-400">Controlled execution: inspect dry-run diffs, risk assessment, and rollback procedures before applying changes.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Remediation Cards List */}
          <div className="space-y-4 lg:col-span-7">
            {remediations.map((rem) => {
              const isSelected = selectedRemediation?.remediationId === rem.remediationId
              const remId = rem._id || rem.remediationId
              const isPending = rem.status === 'pending_approval'
              const isExecuted = rem.status === 'executed'

              return (
                <div
                  key={rem.remediationId}
                  onClick={() => setSelectedRemediation(rem)}
                  className={`rounded-3xl border p-5 transition cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500/50 bg-slate-900/90 shadow-glow'
                      : 'border-slate-800 bg-slate-950/80 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-cyan-400">{rem.remediationId}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-wider font-semibold ${getRiskBadge(rem.riskLevel)}`}>
                          Risk: {rem.riskLevel}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs uppercase tracking-wider font-semibold ${getStatusBadge(rem.status)}`}>
                          {rem.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-white">{rem.title}</h3>
                      <p className="mt-1 text-sm text-slate-300 leading-relaxed">{rem.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                    <span className="text-xs text-slate-400">Target: <strong className="text-slate-200">{rem.targetNamespace}/{rem.targetResource}</strong></span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApproveAndExecute(rem)}
                            disabled={actionLoading[remId]}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition disabled:opacity-50"
                          >
                            <Play className="h-3.5 w-3.5" />
                            {actionLoading[remId] ? 'Executing...' : 'Approve & Execute'}
                          </button>
                          <button
                            onClick={() => handleReject(rem)}
                            disabled={actionLoading[remId]}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      )}

                      {isExecuted && (
                        <button
                          onClick={() => handleRollback(rem)}
                          disabled={actionLoading[remId]}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {actionLoading[remId] ? 'Rolling back...' : 'Rollback Changes'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selected Remediation Detail / Diff / Rollback Panel */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel lg:col-span-5 sticky top-6">
            {selectedRemediation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Execution Plan</h3>
                  <span className="font-mono text-xs text-cyan-400">{selectedRemediation.remediationId}</span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Target Resource</p>
                  <p className="mt-1 text-sm font-medium text-white">{selectedRemediation.targetKind} in namespace <strong className="text-cyan-400">{selectedRemediation.targetNamespace}</strong></p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileCode className="h-3.5 w-3.5 text-cyan-400" /> Proposed Dry-Run Changes (Diff)
                  </p>
                  <pre className="mt-2 rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800">
                    {selectedRemediation.dryRunDiff || 'No diff available.'}
                  </pre>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5 text-amber-400" /> Automated Rollback Plan
                  </p>
                  <div className="mt-2 rounded-2xl bg-slate-950 p-3 font-mono text-xs text-amber-300 border border-slate-800 break-all">
                    {selectedRemediation.rollbackPlan || 'No automated rollback defined.'}
                  </div>
                </div>

                {selectedRemediation.executionResult && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">Execution Result</p>
                    <p className="mt-1 text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-2xl border border-emerald-900/60 font-mono">
                      {selectedRemediation.executionResult}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Select a remediation proposal to inspect details.</p>
            )}
          </div>
        </div>
      </section>

      {/* Active Incidents & Alerts List */}
      <section className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
        <h2 className="mb-4 text-xl font-semibold text-white">Active Cluster Incidents & Alerts</h2>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert._id || alert.id} className="rounded-3xl bg-slate-950/80 p-5 border border-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 text-xs uppercase font-semibold">
                      {alert.severity}
                    </span>
                    <span className="text-xs text-slate-400">Namespace: <strong className="text-slate-200">{alert.namespace || 'default'}</strong></span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-white">{alert.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{alert.description}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-wider text-slate-300">
                  {alert.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
