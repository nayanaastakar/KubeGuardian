import mongoose, { Document, Schema } from 'mongoose'

export interface ISettings extends Document {
  general: {
    clusterName: string
    adminEmail: string
    timezone: string
    language: string
    autoRefreshInterval: number
  }
  notifications: {
    channels: {
      email: { enabled: boolean; address: string }
      slack: { enabled: boolean; webhook: string }
      discord: { enabled: boolean; webhook: string }
      telegram: { enabled: boolean; botToken: string; chatId: string }
    }
  }
  security: {
    enableRBAC: boolean
    requireMFA: boolean
    sessionTimeout: number
    passwordMinLength: number
    enableAuditLogs: boolean
  }
  integrations: {
    prometheus: { name: string; enabled: boolean; status: string }
    grafana: { name: string; enabled: boolean; status: string }
    trivy: { name: string; enabled: boolean; status: string }
    falco: { name: string; enabled: boolean; status: string }
  }
  updatedAt: Date
}

const SettingsSchema = new Schema<ISettings>({
  general: {
    clusterName: { type: String, default: 'KubeGuardian Cluster' },
    adminEmail: { type: String, default: 'admin@kubeguardian.io' },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'English' },
    autoRefreshInterval: { type: Number, default: 30 }
  },
  notifications: {
    channels: {
      email: {
        enabled: { type: Boolean, default: true },
        address: { type: String, default: '' }
      },
      slack: {
        enabled: { type: Boolean, default: false },
        webhook: { type: String, default: '' }
      },
      discord: {
        enabled: { type: Boolean, default: false },
        webhook: { type: String, default: '' }
      },
      telegram: {
        enabled: { type: Boolean, default: false },
        botToken: { type: String, default: '' },
        chatId: { type: String, default: '' }
      }
    }
  },
  security: {
    enableRBAC: { type: Boolean, default: true },
    requireMFA: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 3600 },
    passwordMinLength: { type: Number, default: 12 },
    enableAuditLogs: { type: Boolean, default: true }
  },
  integrations: {
    prometheus: {
      name: { type: String, default: 'Prometheus' },
      enabled: { type: Boolean, default: true },
      status: { type: String, default: 'connected' }
    },
    grafana: {
      name: { type: String, default: 'Grafana' },
      enabled: { type: Boolean, default: true },
      status: { type: String, default: 'connected' }
    },
    trivy: {
      name: { type: String, default: 'Trivy' },
      enabled: { type: Boolean, default: true },
      status: { type: String, default: 'connected' }
    },
    falco: {
      name: { type: String, default: 'Falco' },
      enabled: { type: Boolean, default: true },
      status: { type: String, default: 'connected' }
    }
  }
}, {
  timestamps: true
})

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema)
