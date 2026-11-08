import { useState, useEffect } from 'react'
import { ShieldAlert, AlertTriangle, Search, Filter, Play, CheckCircle2, RefreshCw } from 'lucide-react'
import { getVulnerabilities, updateVulnerabilityStatus, startSecurityScan } from '../services/api'
import { useNotificationsStore } from '../store/notificationsStore'

export function VulnerabilitiesPage() {
  const addNotification = useNotificationsStore((state) => state.addNotification)
  const [vulns, setVulns] = useState<any[]>([])
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanTarget, setScanTarget] = useState('registry.k8s.local/payments:1.4.2')

  const fetchVulns = async () => {
    try {
      const res = await getVulnerabilities({
        severity: severityFilter === 'all' ? undefined : severityFilter,
        search: search.trim() || undefined
      })
      if (res.data?.data) {
        setVulns(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch vulnerabilities:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVulns()
  }, [severityFilter, search])

  const handleStatusToggle = async (vuln: any) => {
    const newStatus = vuln.status === 'resolved' ? 'active' : 'resolved'
    try {
      await updateVulnerabilityStatus(vuln._id || vuln.cveId, newStatus)
      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `${vuln.cveId} marked as ${newStatus}.`
      })
      fetchVulns()
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: err.message
      })
    }
  }

  const handleTriggerScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scanTarget.trim()) return

    setScanning(true)
    try {
      const res = await startSecurityScan({
        type: 'image',
        target: scanTarget.trim()
      })
      addNotification({
        type: 'success',
        title: 'Trivy Scan Completed',
        message: `Found ${res.data?.data?.vulnerabilitiesFound || 0} vulnerability findings for ${scanTarget}.`
      })
      fetchVulns()
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Scan Failed',
        message: err.response?.data?.error || err.message
      })
    } finally {
      setScanning(false)
    }
  }

  const severities = ['all', 'critical', 'high', 'medium', 'low']

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40'
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Vulnerability Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Trivy CVE & Risk Detection</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            Continuous Image & Manifest Scans
          </div>
        </div>
      </section>

      {/* Trigger Scan Form */}
      <section className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-white mb-2">Execute Container Vulnerability Scan (Trivy)</h2>
        <form onSubmit={handleTriggerScan} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={scanTarget}
            onChange={(e) => setScanTarget(e.target.value)}
            placeholder="e.g. registry.k8s.local/payments:1.4.2 or nginx:1.18.0"
            className="flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
          />
          <button
            type="submit"
            disabled={scanning}
            className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {scanning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {scanning ? 'Scanning Image...' : 'Run Trivy Scan'}
          </button>
        </form>
      </section>

      {/* Filter and Search Bar */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          {severities.map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search CVE, package..."
            className="rounded-2xl border border-slate-800 bg-slate-950/80 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
          />
        </div>
      </section>

      {/* Vulnerabilities Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3">CVE Identifier</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">CVSS</th>
              <th className="px-4 py-3">Installed / Fixed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {vulns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No vulnerabilities matching current criteria.
                </td>
              </tr>
            ) : (
              vulns.map((item) => (
                <tr key={item._id || item.cveId} className="border-b border-slate-800/60 hover:bg-slate-950/90">
                  <td className="px-4 py-4 font-mono font-medium text-white">
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${item.cveId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline"
                    >
                      {item.cveId}
                    </a>
                    <div className="text-xs text-slate-400 font-sans mt-0.5 line-clamp-1">{item.title}</div>
                  </td>
                  <td className="px-4 py-4 font-mono text-slate-300">{item.package}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs uppercase font-semibold ${getSeverityBadge(item.severity)}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-white font-semibold">{item.cvssScore || item.score || '7.5'}</td>
                  <td className="px-4 py-4 text-xs font-mono">
                    <div className="text-rose-400">{item.version || 'vulnerable'}</div>
                    <div className="text-emerald-400">{item.fixedVersion ? `→ ${item.fixedVersion}` : 'No fix'}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs uppercase font-semibold ${
                      item.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.status === 'resolved' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3 text-amber-400" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleStatusToggle(item)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition"
                    >
                      {item.status === 'resolved' ? 'Re-open' : 'Mark Resolved'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
