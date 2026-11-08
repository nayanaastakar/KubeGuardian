import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore, mergePlatformSettings } from '../store/settingsStore'

describe('Settings Store & Schema Merging', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings()
  })

  it('initializes with default platform settings', () => {
    const settings = useSettingsStore.getState().settings
    expect(settings.general.clusterName).toBe('KubeGuardian Cluster')
    expect(settings.security.enableRBAC).toBe(true)
    expect(settings.notifications.channels.email.enabled).toBe(true)
  })

  it('updates general configuration partially', () => {
    useSettingsStore.getState().updateGeneral({ clusterName: 'Production K8s US-East' })
    const settings = useSettingsStore.getState().settings
    expect(settings.general.clusterName).toBe('Production K8s US-East')
    expect(settings.general.timezone).toBe('UTC')
  })

  it('updates security policies', () => {
    useSettingsStore.getState().updateSecurity({ sessionTimeout: 7200, requireMFA: true })
    const settings = useSettingsStore.getState().settings
    expect(settings.security.sessionTimeout).toBe(7200)
    expect(settings.security.requireMFA).toBe(true)
  })

  it('merges saved platform settings preserving nested notification channels', () => {
    const saved = {
      general: { clusterName: 'Custom Clust' } as any,
      notifications: {
        channels: {
          slack: { enabled: true, webhook: 'https://custom-webhook' }
        }
      } as any
    }

    const merged = mergePlatformSettings(saved)
    expect(merged.general.clusterName).toBe('Custom Clust')
    expect(merged.notifications.channels.slack.enabled).toBe(true)
    expect(merged.notifications.channels.email.enabled).toBe(true)
  })
})
