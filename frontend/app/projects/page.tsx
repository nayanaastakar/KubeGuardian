'use client'

import { useState, useEffect } from 'react'
import {
  FolderKanban, Plus, X, Loader2, RefreshCw, Trash2, Shield,
  AlertTriangle, CheckCircle, Code2, GitBranch, Tag, Users,
  ChevronRight, BarChart3, Activity, Zap,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useProjectStore, type Project } from '@/store/projectStore'

/* ── helpers ──────────────────────────────── */
const ENV_COLORS: Record<string, string> = {
  production: 'bg-red-500/20 text-red-300 border-red-500/30',
  staging: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  development: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  testing: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  inactive: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  archived: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="28" cy="28" r={r} fill="none"
        stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
        {score}
      </text>
    </svg>
  )
}

const INITIAL_FORM = {
  name: '',
  description: '',
  environment: 'development' as Project['environment'],
  repository: '',
  team: '',
  tags: '',
}

/* ── Page ──────────────────────────────────── */
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const { activeProject, setActiveProject } = useProjectStore()

  useEffect(() => { fetchProjects() }, [])

  const authHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  })

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/projects', { headers: authHeader() })
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {
      toast.error('Could not reach backend — showing demo data')
      setProjects(DEMO_PROJECTS)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }
      const res = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setProjects((prev) => [data.data, ...prev])
        toast.success(`Project "${data.data.name}" created!`)
        setShowModal(false)
        setForm(INITIAL_FORM)
      } else {
        // fallback: optimistic demo add
        const demo: Project = {
          _id: `demo-${Date.now()}`,
          ...payload,
          status: 'active',
          securityScore: 75,
          totalVulnerabilities: 0,
          criticalVulnerabilities: 0,
          complianceScore: 80,
          clusterCount: 0,
          tags: payload.tags,
          lastScanned: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
        setProjects((prev) => [demo, ...prev])
        toast.success(`Project "${demo.name}" created (offline mode)!`)
        setShowModal(false)
        setForm(INITIAL_FORM)
      }
    } catch {
      toast.error('Failed to create project')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await fetch(`http://localhost:8000/api/projects/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      })
      setProjects((prev) => prev.filter((p) => p._id !== id))
      if (activeProject?._id === id) setActiveProject(null)
      toast.success('Project deleted')
    } catch {
      setProjects((prev) => prev.filter((p) => p._id !== id))
      if (activeProject?._id === id) setActiveProject(null)
      toast.success('Project removed')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSelect = (project: Project) => {
    if (activeProject?._id === project._id) {
      setActiveProject(null)
      toast('Project deselected', { icon: '🔓' })
    } else {
      setActiveProject(project)
      toast.success(`Now working in "${project.name}"`)
    }
  }

  const active = projects.filter((p) => p.status === 'active').length
  const avgScore = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.securityScore ?? 0), 0) / projects.length)
    : 0
  const totalVulns = projects.reduce((s, p) => s + (p.totalVulnerabilities ?? 0), 0)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--kg-bg-primary)' }}>

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-blue-400" /> Projects
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select a project to scope the dashboard to its security posture.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProjects}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        </div>

        {/* ── Active project banner ── */}
        {activeProject && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white font-medium">
                Active project: <span className="text-blue-300 font-bold">{activeProject.name}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${ENV_COLORS[activeProject.environment]}`}>
                {activeProject.environment}
              </span>
            </div>
            <button
              onClick={() => setActiveProject(null)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'text-blue-400' },
            { label: 'Active', value: active, icon: Activity, color: 'text-emerald-400' },
            { label: 'Avg Security Score', value: `${avgScore}/100`, icon: Shield, color: 'text-violet-400' },
            { label: 'Total Vulnerabilities', value: totalVulns, icon: AlertTriangle, color: 'text-amber-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="kg-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{kpi.label}</p>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="text-3xl font-bold text-white">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* ── Project Cards Grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-500 text-sm mt-3">Loading projects…</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <FolderKanban className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-white font-semibold">No projects yet</p>
            <p className="text-sm text-slate-500 mt-1">Create your first project to start scanning.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => {
              const isSelected = activeProject?._id === project._id
              const scoreColor = (project.securityScore ?? 0) >= 80 ? '#34d399' : (project.securityScore ?? 0) >= 60 ? '#fbbf24' : '#f87171'
              return (
                <div
                  key={project._id}
                  onClick={() => handleSelect(project)}
                  className={`kg-card rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-blue-500/40 ${
                    isSelected ? 'ring-2 ring-blue-500/60 bg-blue-500/5' : ''
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">{project.name}</h3>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.description || 'No description'}</p>
                    </div>
                    <div className="ml-3 flex items-center gap-1 shrink-0">
                      <ScoreRing score={project.securityScore ?? 0} color={scoreColor} />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${ENV_COLORS[project.environment]}`}>
                      {project.environment}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${STATUS_COLORS[project.status]}`}>
                      {project.status}
                    </span>
                    {project.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-slate-400 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="p-2 rounded-xl bg-white/3">
                      <div className={`text-sm font-bold ${(project.criticalVulnerabilities ?? 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {project.criticalVulnerabilities ?? 0}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Critical</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/3">
                      <div className="text-sm font-bold text-amber-400">{project.totalVulnerabilities ?? 0}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Total CVEs</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/3">
                      <div className="text-sm font-bold text-blue-400">{project.complianceScore ?? 0}%</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Compliance</div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="space-y-1.5 border-t border-white/5 pt-3">
                    {project.repository && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <GitBranch className="w-3 h-3 shrink-0" />
                        <span className="truncate">{project.repository}</span>
                      </div>
                    )}
                    {project.team && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>{project.team}</span>
                      </div>
                    )}
                    {project.lastScanned && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        <span>Last scanned {new Date(project.lastScanned).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect(project) }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/20'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      {isSelected ? 'Selected' : 'Select Project'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(project._id, project.name) }}
                      disabled={deletingId === project._id}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      {deletingId === project._id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Create Project Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg kg-card rounded-2xl shadow-2xl border border-white/10">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white">Create New Project</h2>
                <p className="text-xs text-slate-400 mt-0.5">Add a project to track its security posture</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setForm(INITIAL_FORM) }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Project Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. payments-service"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of this project…"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Environment</label>
                  <select
                    value={form.environment}
                    onChange={(e) => setForm({ ...form, environment: e.target.value as Project['environment'] })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Team</label>
                  <input
                    value={form.team}
                    onChange={(e) => setForm({ ...form, team: e.target.value })}
                    placeholder="e.g. Platform Engineering"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Repository URL</label>
                  <input
                    value={form.repository}
                    onChange={(e) => setForm({ ...form, repository: e.target.value })}
                    placeholder="github.com/org/repo"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Tags <span className="text-slate-600 font-normal">(comma separated)</span>
                  </label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="pci-dss, soc2, critical"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(INITIAL_FORM) }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

/* ── Demo data for offline mode ── */
const DEMO_PROJECTS: Project[] = [
  {
    _id: 'demo-1',
    name: 'payments-service',
    description: 'Core payment processing microservice (PCI-DSS scoped)',
    environment: 'production',
    status: 'active',
    repository: 'github.com/org/payments-service',
    team: 'Platform Engineering',
    tags: ['critical', 'pci-dss'],
    securityScore: 82,
    totalVulnerabilities: 14,
    criticalVulnerabilities: 2,
    complianceScore: 91,
    clusterCount: 2,
    lastScanned: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'demo-2',
    name: 'auth-gateway',
    description: 'Authentication & authorization gateway service',
    environment: 'production',
    status: 'active',
    repository: 'github.com/org/auth-gateway',
    team: 'Security Team',
    tags: ['auth', 'soc2'],
    securityScore: 94,
    totalVulnerabilities: 3,
    criticalVulnerabilities: 0,
    complianceScore: 97,
    clusterCount: 1,
    lastScanned: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: 'demo-3',
    name: 'data-pipeline',
    description: 'Real-time ingestion and stream processing pipeline',
    environment: 'staging',
    status: 'active',
    repository: 'github.com/org/data-pipeline',
    team: 'Data Engineering',
    tags: ['data', 'kafka'],
    securityScore: 65,
    totalVulnerabilities: 28,
    criticalVulnerabilities: 5,
    complianceScore: 72,
    clusterCount: 1,
    lastScanned: new Date(Date.now() - 86400000).toISOString(),
  },
]
