import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationChannel = 'email' | 'slack' | 'discord' | 'telegram'

export interface NotificationSettings {
  channels: {
    email: { enabled: boolean; address: string }
    slack: { enabled: boolean; webhook: string }
    discord: { enabled: boolean; webhook: string }
    telegram: { enabled: boolean; botToken: string; chatId: string }
  }
}

export interface SecurityPolicy {
  enableRBAC: boolean
  requireMFA: boolean
  sessionTimeout: number
  passwordMinLength: number
  enableAuditLogs: boolean
}

export interface Integration {
  name: string
  enabled: boolean
  status: 'connected' | 'disconnected' | 'error'
  details?: Record<string, string>
}

export interface GeneralConfig {
  clusterName: string
  adminEmail: string
  timezone: string
  language: string
  autoRefreshInterval: number
}

export interface PlatformSettings {
  general: GeneralConfig
  notifications: NotificationSettings
  security: SecurityPolicy
  integrations: {
    prometheus: Integration
    grafana: Integration
    trivy: Integration
    falco: Integration
  }
}

type SettingsState = {
  settings: PlatformSettings
  updateGeneral: (general: Partial<GeneralConfig>) => void
  updateNotifications: (notifications: Partial<NotificationSettings>) => void
  updateSecurity: (security: Partial<SecurityPolicy>) => void
  updateIntegration: (name: string, integration: Partial<Integration>) => void
  resetSettings: () => void
}

const defaultSettings: PlatformSettings = {
  general: {
    clusterName: 'KubeGuardian Cluster',
    adminEmail: 'admin@kubeguardian.io',
    timezone: 'UTC',
    language: 'English',
    autoRefreshInterval: 30
  },
  notifications: {
    channels: {
      email: { enabled: true, address: '' },
      slack: { enabled: false, webhook: '' },
      discord: { enabled: false, webhook: '' },
      telegram: { enabled: false, botToken: '', chatId: '' }
    }
  },
  security: {
    enableRBAC: true,
    requireMFA: false,
    sessionTimeout: 3600,
    passwordMinLength: 12,
    enableAuditLogs: true
  },
  integrations: {
    prometheus: { name: 'Prometheus', enabled: true, status: 'connected' },
    grafana: { name: 'Grafana', enabled: true, status: 'connected' },
    trivy: { name: 'Trivy', enabled: true, status: 'connected' },
    falco: { name: 'Falco', enabled: true, status: 'connected' }
  }
}

/** Merge persisted JSON with defaults so new fields and nested channels stay valid after upgrades. */
export function mergePlatformSettings(saved: Partial<PlatformSettings> | undefined): PlatformSettings {
  if (!saved) return defaultSettings
  return {
    general: { ...defaultSettings.general, ...saved.general },
    notifications: {
      channels: {
        email: { ...defaultSettings.notifications.channels.email, ...saved.notifications?.channels?.email },
        slack: { ...defaultSettings.notifications.channels.slack, ...saved.notifications?.channels?.slack },
        discord: { ...defaultSettings.notifications.channels.discord, ...saved.notifications?.channels?.discord },
        telegram: { ...defaultSettings.notifications.channels.telegram, ...saved.notifications?.channels?.telegram }
      }
    },
    security: { ...defaultSettings.security, ...saved.security },
    integrations: {
      prometheus: { ...defaultSettings.integrations.prometheus, ...saved.integrations?.prometheus },
      grafana: { ...defaultSettings.integrations.grafana, ...saved.integrations?.grafana },
      trivy: { ...defaultSettings.integrations.trivy, ...saved.integrations?.trivy },
      falco: { ...defaultSettings.integrations.falco, ...saved.integrations?.falco }
    }
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateGeneral: (general) =>
        set((state) => ({
          settings: {
            ...state.settings,
            general: { ...state.settings.general, ...general }
          }
        })),
      updateNotifications: (notifications) =>
        set((state) => {
          const prev = state.settings.notifications
          const nextChannels = notifications.channels
            ? {
                email: { ...prev.channels.email, ...notifications.channels?.email },
                slack: { ...prev.channels.slack, ...notifications.channels?.slack },
                discord: { ...prev.channels.discord, ...notifications.channels?.discord },
                telegram: { ...prev.channels.telegram, ...notifications.channels?.telegram }
              }
            : prev.channels
          return {
            settings: {
              ...state.settings,
              notifications: {
                ...prev,
                ...notifications,
                channels: nextChannels
              }
            }
          }
        }),
      updateSecurity: (security) =>
        set((state) => ({
          settings: {
            ...state.settings,
            security: { ...state.settings.security, ...security }
          }
        })),
      updateIntegration: (name, integration) =>
        set((state) => ({
          settings: {
            ...state.settings,
            integrations: {
              ...state.settings.integrations,
              [name]: { ...state.settings.integrations[name as keyof typeof state.settings.integrations], ...integration }
            }
          }
        })),
      resetSettings: () => set(() => ({ settings: defaultSettings }))
    }),
    {
      name: 'kubeguardian-settings',
      partialize: (state) => ({ settings: state.settings }),
      merge: (persisted, current) => {
        const p = persisted as Partial<SettingsState> | undefined
        return {
          ...current,
          settings: mergePlatformSettings(p?.settings)
        }
      }
    }
  )
)
