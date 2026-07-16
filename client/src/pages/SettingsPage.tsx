import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, ShieldCheck, Bell, Globe, Check, AlertCircle, ToggleRight, ToggleLeft } from 'lucide-react'
import { useSettingsStore, type GeneralConfig, type SecurityPolicy } from '../store/settingsStore'
import { useNotificationsStore } from '../store/notificationsStore'

function parsePositiveInt(raw: string, fallback: number): number {
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings)
  const updateGeneral = useSettingsStore((state) => state.updateGeneral)
  const updateNotifications = useSettingsStore((state) => state.updateNotifications)
  const updateSecurity = useSettingsStore((state) => state.updateSecurity)
  const updateIntegration = useSettingsStore((state) => state.updateIntegration)

  const addNotification = useNotificationsStore((state) => state.addNotification)

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'security' | 'notifications'>('general')

  const handleSave = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('success')
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Platform settings have been updated successfully'
      })
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1500)
  }

  const handleGeneralChange = (key: string, value: any) => {
    updateGeneral({ [key]: value } as Partial<GeneralConfig>)
  }

  const handleSecurityChange = (key: string, value: any) => {
    updateSecurity({ [key]: value } as Partial<SecurityPolicy>)
  }

  const handleNotificationChannelChange = (channel: string, field: string, value: any) => {
    const channels = useSettingsStore.getState().settings.notifications.channels
    updateNotifications({
      channels: {
        ...channels,
        [channel]: {
          ...channels[channel as keyof typeof channels],
          [field]: value
        }
      }
    })
  }

  const toggleIntegration = (name: string) => {
    const current = settings.integrations[name as keyof typeof settings.integrations]
    updateIntegration(name, {
      enabled: !current.enabled
    })
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Settings</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Platform configuration</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
            <Settings className="h-5 w-5 text-cyan-400" /> Ready for production
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-2 shadow-panel backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* General Configuration */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel"
        >
          <h2 className="mb-6 text-xl font-semibold text-white">General Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">Cluster Name</label>
              <input
                type="text"
                value={settings.general.clusterName}
                onChange={(e) => handleGeneralChange('clusterName', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 transition focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Admin Email</label>
              <input
                type="email"
                value={settings.general.adminEmail}
                onChange={(e) => handleGeneralChange('adminEmail', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 transition focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-300">Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 transition focus:border-cyan-500 focus:outline-none"
                >
                  <option>UTC</option>
                  <option>EST</option>
                  <option>PST</option>
                  <option>IST</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Auto Refresh (seconds)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.general.autoRefreshInterval}
                  onChange={(e) =>
                    handleGeneralChange(
                      'autoRefreshInterval',
                      parsePositiveInt(e.target.value, settings.general.autoRefreshInterval)
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 transition focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Integrations */}
      {activeTab === 'integrations' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {Object.entries(settings.integrations).map(([key, integration]) => (
            <div key={key} className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Status:{' '}
                    <span className={integration.status === 'connected' ? 'text-emerald-400' : 'text-amber-400'}>
                      {integration.status}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => toggleIntegration(key)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  {integration.enabled ? (
                    <ToggleRight className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-slate-500" />
                  )}
                  {integration.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Security Policies */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel"
        >
          <h2 className="mb-6 text-xl font-semibold text-white">Security Policies</h2>
          <div className="space-y-5">
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-700 bg-slate-950/80 p-4 transition hover:border-slate-600">
              <input
                type="checkbox"
                checked={settings.security.enableRBAC}
                onChange={(e) => handleSecurityChange('enableRBAC', e.target.checked)}
                className="h-5 w-5 cursor-pointer rounded"
              />
              <div>
                <p className="font-semibold text-white">Enable RBAC</p>
                <p className="text-sm text-slate-400">Role-Based Access Control</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-700 bg-slate-950/80 p-4 transition hover:border-slate-600">
              <input
                type="checkbox"
                checked={settings.security.requireMFA}
                onChange={(e) => handleSecurityChange('requireMFA', e.target.checked)}
                className="h-5 w-5 cursor-pointer rounded"
              />
              <div>
                <p className="font-semibold text-white">Require MFA</p>
                <p className="text-sm text-slate-400">Multi-Factor Authentication</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-700 bg-slate-950/80 p-4 transition hover:border-slate-600">
              <input
                type="checkbox"
                checked={settings.security.enableAuditLogs}
                onChange={(e) => handleSecurityChange('enableAuditLogs', e.target.checked)}
                className="h-5 w-5 cursor-pointer rounded"
              />
              <div>
                <p className="font-semibold text-white">Enable Audit Logs</p>
                <p className="text-sm text-slate-400">Comprehensive security logging</p>
              </div>
            </label>
            <div>
              <label className="block text-sm font-medium text-slate-300">Session Timeout (seconds)</label>
              <input
                type="number"
                min={0}
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  handleSecurityChange(
                    'sessionTimeout',
                    parsePositiveInt(e.target.value, settings.security.sessionTimeout)
                  )
                }
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 transition focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Min Password Length</label>
              <input
                type="number"
                min={0}
                value={settings.security.passwordMinLength}
                onChange={(e) =>
                  handleSecurityChange(
                    'passwordMinLength',
                    parsePositiveInt(e.target.value, settings.security.passwordMinLength)
                  )
                }
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 transition focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {Object.entries(settings.notifications.channels).map(([channel, config]) => (
            <div key={channel} className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize text-white">{channel}</h3>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => handleNotificationChannelChange(channel, 'enabled', e.target.checked)}
                    className="h-5 w-5 cursor-pointer rounded"
                  />
                  <span className="text-sm text-slate-400">Enabled</span>
                </label>
              </div>
              {config.enabled && (
                <div className="space-y-3">
                  {channel === 'email' && (
                    <input
                      type="email"
                      placeholder="Email address"
                      value={(config as any).address || ''}
                      onChange={(e) => handleNotificationChannelChange(channel, 'address', e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none"
                    />
                  )}
                  {(channel === 'slack' || channel === 'discord') && (
                    <input
                      type="text"
                      placeholder="Webhook URL"
                      value={(config as any).webhook || ''}
                      onChange={(e) => handleNotificationChannelChange(channel, 'webhook', e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none"
                    />
                  )}
                  {channel === 'telegram' && (
                    <>
                      <input
                        type="text"
                        placeholder="Bot Token"
                        value={(config as any).botToken || ''}
                        onChange={(e) => handleNotificationChannelChange(channel, 'botToken', e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Chat ID"
                        value={(config as any).chatId || ''}
                        onChange={(e) => handleNotificationChannelChange(channel, 'chatId', e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold transition ${
            saveStatus === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : saveStatus === 'error'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'btn-primary'
          }`}
        >
          {saveStatus === 'saving' && <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
          {saveStatus === 'success' && <Check className="h-5 w-5" />}
          {saveStatus === 'error' && <AlertCircle className="h-5 w-5" />}
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

