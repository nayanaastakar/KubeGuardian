import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
  autoDismiss?: boolean
}

type NotificationsState = {
  notifications: Notification[]
  unreadCount: number
  browserNotificationsEnabled: boolean
  soundEnabled: boolean
  autoDismissEnabled: boolean
  autoDismissDelay: number // in milliseconds
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  toggleBrowserNotifications: () => void
  toggleSound: () => void
  toggleAutoDismiss: () => void
  setAutoDismissDelay: (delay: number) => void
  requestNotificationPermission: () => Promise<NotificationPermission>
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: '1',
          type: 'success',
          title: 'Cluster Connected',
          message: 'Successfully connected to KubeGuardian Cluster',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          read: false
        },
        {
          id: '2',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'payments-service memory usage at 85%',
          timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
          read: false
        },
        {
          id: '3',
          type: 'error',
          title: 'Pod Crash Detected',
          message: 'Pod crashed in production namespace, auto-restart triggered',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          read: true
        }
      ],
      unreadCount: 2,
      browserNotificationsEnabled: false,
      soundEnabled: true,
      autoDismissEnabled: false,
      autoDismissDelay: 5000,

      addNotification: (notification) => {
        const state = get()
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          read: false
        }

        // Show browser notification if enabled and permission granted
        if (state.browserNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          const browserNotification = new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico',
            tag: newNotification.id
          })

          browserNotification.onclick = () => {
            window.focus()
            browserNotification.close()
          }

          // Auto-close browser notification after 5 seconds
          setTimeout(() => browserNotification.close(), 5000)
        }

        // Play sound if enabled
        if (state.soundEnabled) {
          playNotificationSound(newNotification.type)
        }

        // Auto-dismiss if enabled
        if (state.autoDismissEnabled && notification.autoDismiss !== false) {
          setTimeout(() => {
            const currentState = get()
            const notificationExists = currentState.notifications.find(n => n.id === newNotification.id)
            if (notificationExists && !notificationExists.read) {
              get().markAsRead(newNotification.id)
            }
          }, state.autoDismissDelay)
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }))
      },

      markAsRead: (id) =>
        set((state) => {
          const target = state.notifications.find((n) => n.id === id)
          const wasUnread = Boolean(target && !target.read)
          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          }
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0
        })),

      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          }
        }),

      clearNotifications: () =>
        set(() => ({
          notifications: [],
          unreadCount: 0
        })),

      toggleBrowserNotifications: () =>
        set((state) => ({ browserNotificationsEnabled: !state.browserNotificationsEnabled })),

      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),

      toggleAutoDismiss: () =>
        set((state) => ({ autoDismissEnabled: !state.autoDismissEnabled })),

      setAutoDismissDelay: (delay) =>
        set(() => ({ autoDismissDelay: delay })),

      requestNotificationPermission: async () => {
        if (!('Notification' in window)) {
          return 'denied'
        }

        if (Notification.permission === 'granted') {
          return 'granted'
        }

        if (Notification.permission === 'denied') {
          return 'denied'
        }

        const permission = await Notification.requestPermission()
        return permission
      }
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({
        browserNotificationsEnabled: state.browserNotificationsEnabled,
        soundEnabled: state.soundEnabled,
        autoDismissEnabled: state.autoDismissEnabled,
        autoDismissDelay: state.autoDismissDelay
      })
    }
  )
)

// Helper function to play notification sounds
function playNotificationSound(type: 'info' | 'warning' | 'error' | 'success') {
  try {
    const audio = new Audio()

    // Create different frequencies for different notification types
    const context = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    // Set frequency based on notification type
    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(800, context.currentTime)
        break
      case 'warning':
        oscillator.frequency.setValueAtTime(600, context.currentTime)
        break
      case 'error':
        oscillator.frequency.setValueAtTime(400, context.currentTime)
        break
      case 'info':
      default:
        oscillator.frequency.setValueAtTime(500, context.currentTime)
        break
    }

    gainNode.gain.setValueAtTime(0.1, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.5)
  } catch (error) {
    // Fallback: try to use a simple beep sound
    console.warn('Web Audio API not supported, notification sound disabled')
  }
}
