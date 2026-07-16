import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, SunMedium, Bell, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useUiStore } from '../../store/uiStore'
import { useNotificationsStore } from '../../store/notificationsStore'
import { mainNavigation } from './Sidebar'

const notificationColors = {
  info: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  error: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
}

export function TopNav() {
  const darkMode = useUiStore((state) => state.darkMode)
  const setDarkMode = useUiStore((state) => state.setDarkMode)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null)
  const [menuBounds, setMenuBounds] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const notifications = useNotificationsStore((state) => state.notifications)
  const unreadCount = useNotificationsStore((state) => state.unreadCount)
  const markAsRead = useNotificationsStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead)
  const removeNotification = useNotificationsStore((state) => state.removeNotification)
  const browserNotificationsEnabled = useNotificationsStore((state) => state.browserNotificationsEnabled)
  const soundEnabled = useNotificationsStore((state) => state.soundEnabled)
  const autoDismissEnabled = useNotificationsStore((state) => state.autoDismissEnabled)
  const toggleBrowserNotifications = useNotificationsStore((state) => state.toggleBrowserNotifications)
  const toggleSound = useNotificationsStore((state) => state.toggleSound)
  const toggleAutoDismiss = useNotificationsStore((state) => state.toggleAutoDismiss)
  const requestNotificationPermission = useNotificationsStore((state) => state.requestNotificationPermission)

  const selectedNotification = notifications.find((notif) => notif.id === selectedNotificationId)

  useEffect(() => {
    if (!notificationOpen) {
      return
    }

    const updateBounds = () => {
      if (buttonRef.current) {
        setMenuBounds(buttonRef.current.getBoundingClientRect())
      }
    }

    updateBounds()
    window.addEventListener('resize', updateBounds)
    window.addEventListener('scroll', updateBounds)
    return () => {
      window.removeEventListener('resize', updateBounds)
      window.removeEventListener('scroll', updateBounds)
    }
  }, [notificationOpen])

  return (
    <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-panel backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Enterprise AI Platform</p>
        <h2 className="text-3xl font-semibold text-white">Kubernetes DevSecOps Intelligence</h2>
      </div>

      <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 md:hidden">
        {mainNavigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap transition ${
                  isActive ? 'bg-slate-700 text-white shadow-lg shadow-slate-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="flex items-center gap-3">
        <div className="relative z-50">
          <button
            type="button"
            ref={buttonRef}
            onClick={() => setNotificationOpen((open) => !open)}
            className="relative inline-flex items-center gap-2 rounded-2xl border-2 border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-200 shadow-lg shadow-slate-950/20 transition hover:border-slate-500 hover:text-white hover:bg-slate-700"
          >
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notificationOpen && menuBounds && createPortal(
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="fixed z-[9999] mt-3 w-96 max-w-[90vw] rounded-3xl border border-slate-800 bg-slate-950 shadow-panel"
                style={{
                  top: menuBounds.bottom + 10,
                  left: Math.max(
                    16,
                    Math.min(menuBounds.right - 384, document.documentElement.clientWidth - 16 - 384)
                  )
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-800 p-5">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="border-b border-slate-800 p-4 space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Settings</p>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Browser Notifications</span>
                      <button
                        onClick={async () => {
                          if (!browserNotificationsEnabled) {
                            const permission = await requestNotificationPermission()
                            if (permission === 'granted') {
                              toggleBrowserNotifications()
                            }
                          } else {
                            toggleBrowserNotifications()
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          browserNotificationsEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            browserNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>

                    <label className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Sound Alerts</span>
                      <button
                        onClick={toggleSound}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          soundEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            soundEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>

                    <label className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Auto-dismiss</span>
                      <button
                        onClick={toggleAutoDismiss}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          autoDismissEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            autoDismissEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>

                <div className="max-h-96 space-y-2 overflow-y-auto p-3">
                  {notifications.length === 0 ? (
                    <p className="px-2 py-4 text-center text-sm text-slate-400">No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`rounded-2xl border p-3 cursor-pointer transition ${notificationColors[notif.type]} ${notif.read ? 'opacity-60' : ''}`}
                        onClick={() => {
                          if (!notif.read) markAsRead(notif.id)
                          setSelectedNotificationId(notif.id)
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{notif.title}</p>
                            <p className="mt-1 text-xs opacity-90">{notif.message}</p>
                            <p className="mt-2 text-xs opacity-75">{new Date(notif.timestamp).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notif.id)
                              if (selectedNotificationId === notif.id) {
                                setSelectedNotificationId(null)
                              }
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {selectedNotification && (
                  <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-4 text-slate-200">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Notification detail</p>
                    <h4 className="mt-2 text-lg font-semibold text-white">{selectedNotification.title}</h4>
                    <p className="mt-3 text-sm text-slate-300">{selectedNotification.message}</p>
                    <p className="mt-2 text-xs text-slate-500">{new Date(selectedNotification.timestamp).toLocaleString()}</p>
                    <button
                      type="button"
                      onClick={() => {
                        removeNotification(selectedNotification.id)
                        setSelectedNotificationId(null)
                      }}
                      className="mt-4 inline-flex rounded-2xl bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700"
                    >
                      Dismiss detail
                    </button>
                  </div>
                )}
              </motion.div>,
              document.body
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          {darkMode ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {darkMode ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  )
}

