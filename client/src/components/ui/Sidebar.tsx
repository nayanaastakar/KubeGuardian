import { FolderOpen, ShieldCheck, Signal, Terminal, Sparkles, Clock3, Settings2, Home } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export const mainNavigation = [
  { path: '/overview', label: 'Overview', icon: Home },
  { path: '/clusters', label: 'Cluster Monitoring', icon: Signal },
  { path: '/vulnerabilities', label: 'Vulnerabilities', icon: ShieldCheck },
  { path: '/incidents', label: 'Incident Center', icon: Clock3 },
  { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
  { path: '/chaos', label: 'Chaos Engineering', icon: Terminal },
  { path: '/security', label: 'Security Score', icon: FolderOpen },
  { path: '/settings', label: 'Settings', icon: Settings2 }
] as const

export function Sidebar() {
  return (
    <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-950 p-6 text-slate-300 md:flex">
      <div className="mb-10">
        <div className="mb-3 px-2 text-xs uppercase tracking-[0.3em] text-emerald-400">KubeGuardian AI</div>
        <h1 className="text-2xl font-semibold text-white">DevSecOps Platform</h1>
        <p className="mt-2 text-sm text-slate-400">AI-driven Kubernetes monitoring, security, and remediation.</p>
      </div>

      <nav className="space-y-2">
        {mainNavigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-slate-700 text-white shadow-lg shadow-slate-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-slate-900 p-5 text-sm text-slate-400 shadow-panel">
        <div className="mb-3 text-xs uppercase tracking-[0.3em] text-emerald-400">Live status</div>
        <div className="flex items-center justify-between text-white">
          <span>Streaming metrics</span>
          <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-glow" />
        </div>
      </div>
    </aside>
  )
}
