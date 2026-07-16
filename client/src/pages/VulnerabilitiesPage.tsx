import { ShieldAlert, Database, AlertTriangle } from 'lucide-react'
import { vulnerabilities } from '../services/mockApi'

export function VulnerabilitiesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Vulnerability Reports</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Security risk detection</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
            <ShieldAlert className="h-5 w-5 text-rose-400" /> Critical CVEs detected
          </div>
        </div>
      </section>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="px-4 py-3">CVE</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {vulnerabilities.map((item) => (
              <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-950/90">
                <td className="px-4 py-4 font-medium text-white">{item.id}</td>
                <td className="px-4 py-4">{item.package}</td>
                <td className="px-4 py-4 uppercase text-slate-300">{item.severity}</td>
                <td className="px-4 py-4">{item.service}</td>
                <td className="px-4 py-4">{item.score}</td>
                <td className="px-4 py-4 text-slate-200">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">
                    <AlertTriangle className="h-3 w-3 text-amber-400" /> {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
