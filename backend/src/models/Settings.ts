import mongoose, { Document, Schema } from 'mongoose'

export interface ISettings extends Document {
  integrations: {
    openaiApiKey?: string
    aiModel: string
    slackWebhookUrl?: string
  }
  notifications: {
    channels: string[]
    thresholds: string[]
  }
  securityPolicies: {
    enforcePodSecurity: boolean
    restrictExternalTraffic: boolean
    autoScanImages: boolean
  }
  updatedAt: Date
}

const SettingsSchema = new Schema<ISettings>({
  integrations: {
    openaiApiKey: { type: String, default: '' },
    aiModel: { type: String, default: 'GPT-4 Turbo (Recommended)' },
    slackWebhookUrl: { type: String, default: '' }
  },
  notifications: {
    channels: { type: [String], default: ['slack'] },
    thresholds: { type: [String], default: ['Critical', 'High'] }
  },
  securityPolicies: {
    enforcePodSecurity: { type: Boolean, default: true },
    restrictExternalTraffic: { type: Boolean, default: false },
    autoScanImages: { type: Boolean, default: true }
  }
}, {
  timestamps: true
})

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema)
