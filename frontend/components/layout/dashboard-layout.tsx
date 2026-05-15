'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  Server,
  AlertTriangle,
  BarChart3,
  Settings,
  Menu,
  X,
  Bot,
  GitBranch,
  FileText,
  Bell,
  ChevronRight,
  Activity,
  Zap,
  LogOut,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  FolderKanban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjectStore } from '@/store/projectStore'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Overview', href: '/', icon: BarChart3 },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Clusters', href: '/clusters', icon: Server },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Vulnerabilities', href: '/vulnerabilities', icon: AlertTriangle },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'CI/CD', href: '/cicd', icon: GitBranch },
  { name: 'Compliance', href: '/compliance', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface Notification {
  id: number
  type: 'critical' | 'warning' | 'info' | 'success'
  title: string
  description: string
  time: string
  read: boolean
  suggestedAction?: string
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'critical',
    title: 'Critical Security Alert',
    description: 'Unauthorized exec into pod prod-db-0 detected by Falco runtime.',
    time: '2 min ago',
    read: false,
    suggestedAction: 'Isolate pod and review audit logs immediately.'
  },
  {
    id: 2,
    type: 'warning',
    title: 'High CPU Usage',
    description: 'Cluster staging-us-east-1 CPU usage exceeded 85% threshold.',
    time: '15 min ago',
    read: false,
    suggestedAction: 'Scale horizontal pod autoscaler (HPA) or increase node count.'
  },
  {
    id: 3,
    type: 'critical',
    title: 'New CVE Detected',
    description: 'CVE-2024-1234 (CVSS 9.8) found in payments-service image.',
    time: '1 hour ago',
    read: false,
    suggestedAction: 'Update image to version v1.2.4 and redeploy.'
  },
  {
    id: 4,
    type: 'success',
    title: 'Security Scan Complete',
    description: 'Production cluster scan finished. 3 new issues found.',
    time: '2 hours ago',
    read: true,
  },
  {
    id: 5,
    type: 'info',
    title: 'Policy Update',
    description: 'OPA Gatekeeper policy updated successfully on all clusters.',
    time: '4 hours ago',
    read: true,
  },
  {
    id: 6,
    type: 'warning',
    title: 'Certificate Expiry',
    description: 'TLS certificate for api.internal expires in 7 days.',
    time: '6 hours ago',
    read: true,
    suggestedAction: 'Renew certificate via cert-manager or manual CSR.'
  },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const pathname = usePathname()
  const notifRef = useRef<HTMLDivElement>(null)
  const [userData, setUserData] = useState<{name: string, role: string} | null>(null)
  const { activeProject, setActiveProject } = useProjectStore()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setUserData({ name: data.data.name, role: data.data.role })
      }
    } catch (error) {
      console.error('Failed to fetch user data', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getNotifBg = (type: Notification['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/20'
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20'
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20'
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--kg-bg-primary)' }}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 kg-sidebar',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-blue-500/15">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight">
                  KubeGuardian
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="status-online" />
                  <span className="text-[10px] text-emerald-400 font-medium">AI Active</span>
                </div>
              </div>
            </div>
            <button
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active project pill */}
          {activeProject && (
            <div className="mx-3 mt-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FolderKanban className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-[11px] font-semibold text-blue-300 truncate">{activeProject.name}</span>
              </div>
              <button
                onClick={() => setActiveProject(null)}
                className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                title="Clear project"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto scrollbar-hide">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-3">
              Main Menu
            </div>
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn('kg-nav-item', isActive && 'active')}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
                  <span>{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Bottom user section */}
          <div className="p-4 border-t border-blue-500/15">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
              <Link href="/settings" className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-semibold text-white">
                    {userData?.name ? userData.name.substring(0, 2).toUpperCase() : 'AD'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{userData?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-400 truncate capitalize">{userData?.role.replace('_', ' ') || 'DevSecOps Engineer'}</p>
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="kg-header sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left: Hamburger + Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-slate-500">KubeGuardian</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-white font-medium capitalize">
                  {navigation.find((n) => n.href === pathname)?.name || 'Overview'}
                </span>
              </div>
            </div>

            {/* Right: Status + Notifications + Profile */}
            <div className="flex items-center gap-2">
              {/* Live status indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="status-online" style={{ width: 6, height: 6 }} />
                <span className="text-[11px] font-medium text-emerald-400">3 Clusters Online</span>
              </div>

              {/* Activity icon */}
              <Link 
                href="/monitoring"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="System Monitoring"
              >
                <Activity className="w-5 h-5" />
              </Link>

              {/* Bell notification button */}
              <div className="relative" ref={notifRef}>
                <button
                  id="notification-bell-btn"
                  onClick={() => setNotifOpen((v) => !v)}
                  className={cn(
                    'relative p-2 rounded-xl transition-all duration-200',
                    notifOpen
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {notifOpen && (
                  <div
                    id="notification-panel"
                    className="absolute right-0 mt-2 w-96 notification-panel animate-fade-in z-50"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold text-white text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full border border-red-500/30">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAll}
                            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <Bell className="w-5 h-5 text-slate-500" />
                          </div>
                          <p className="text-sm text-slate-400 font-medium">All caught up!</p>
                          <p className="text-xs text-slate-600 mt-1">No new notifications</p>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={cn(
                                'w-full text-left p-3 rounded-lg border transition-all duration-200 group',
                                getNotifBg(notif.type),
                                !notif.read && 'ring-1 ring-blue-500/20',
                                'hover:brightness-110'
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 shrink-0">
                                  {getNotifIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className={cn(
                                      'text-xs font-semibold truncate',
                                      notif.read ? 'text-slate-400' : 'text-white'
                                    )}>
                                      {notif.title}
                                    </p>
                                    {!notif.read && (
                                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                                    {notif.description}
                                  </p>
                                  {notif.suggestedAction && (
                                    <div className="mt-2 p-1.5 rounded bg-blue-500/10 border border-blue-500/20">
                                      <p className="text-[10px] text-blue-300 font-medium flex items-center gap-1">
                                        <Bot className="w-3 h-3" /> Suggested: {notif.suggestedAction}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1 mt-1.5">
                                    <Clock className="w-3 h-3 text-slate-600" />
                                    <span className="text-[10px] text-slate-600">{notif.time}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Panel Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-white/10">
                        <Link
                          href="/settings"
                          onClick={() => setNotifOpen(false)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center justify-center gap-1"
                        >
                          <Settings className="w-3 h-3" />
                          Manage notification settings
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/10 ml-1">
                <Link 
                  href="/settings"
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-violet-500/50 transition-all"
                >
                  <User className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
