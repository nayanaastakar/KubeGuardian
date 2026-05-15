'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings, Save, Bell, Shield, Cloud, User, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Platform settings state
  const [settings, setSettings] = useState({
    integrations: {
      openaiApiKey: '',
      aiModel: 'GPT-4 Turbo (Recommended)',
      slackWebhookUrl: ''
    },
    notifications: {
      channels: ['slack'],
      thresholds: ['Critical', 'High']
    },
    securityPolicies: {
      enforcePodSecurity: true,
      restrictExternalTraffic: false,
      autoScanImages: true
    }
  })

  useEffect(() => {
    fetchUserData()
    fetchSettings()
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
        setProfile(prev => ({ ...prev, name: data.data.name, email: data.data.email }))
      }
    } catch (error) {
      console.error('Failed to fetch user data', error)
    }
  }

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSave = async () => {
    if (profile.password && profile.password !== profile.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          password: profile.password || undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Profile updated successfully')
        setProfile(prev => ({ ...prev, password: '', confirmPassword: '' }))
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('An error occurred while updating profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingsSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Settings saved successfully')
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      toast.error('An error occurred while saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'User Profile', icon: User, color: 'text-blue-500' },
    { id: 'integrations', name: 'Integrations', icon: Cloud, color: 'text-indigo-500' },
    { id: 'policies', name: 'Security Policies', icon: Shield, color: 'text-emerald-500' },
    { id: 'notifications', name: 'Notifications', icon: Bell, color: 'text-orange-500' }
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your KubeGuardian AI platform configuration.</p>
          </div>
          <Button 
            onClick={activeTab === 'profile' ? handleProfileSave : handleSettingsSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md min-w-[140px]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-2">
            {tabs.map((tab) => (
              <Card 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`glass-effect cursor-pointer transition-all border-0 shadow-sm ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 dark:bg-indigo-950/30 ring-1 ring-indigo-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : 'text-gray-400'}`} />
                  <span className={`font-medium ${activeTab === tab.id ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-600 dark:text-gray-400'}`}>
                    {tab.name}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="md:col-span-3 space-y-6">
            {activeTab === 'profile' && (
              <Card className="glass-effect shadow-md border-0 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and account credentials.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input 
                        value={profile.name} 
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        placeholder="example" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <Input 
                        type="email" 
                        value={profile.email} 
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        placeholder="example@gmail.com" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <Input 
                        type="password" 
                        value={profile.password}
                        onChange={(e) => setProfile({...profile, password: e.target.value})}
                        placeholder="••••••••" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <Input 
                        type="password" 
                        value={profile.confirmPassword}
                        onChange={(e) => setProfile({...profile, confirmPassword: e.target.value})}
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">Leave password blank if you don't want to change it.</p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <Card className="glass-effect shadow-md border-0">
                  <CardHeader>
                    <CardTitle>AI Provider (OpenAI)</CardTitle>
                    <CardDescription>Configure the API key for the AI DevSecOps Assistant.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">OpenAI API Key</label>
                      <Input 
                        type="password" 
                        value={settings.integrations.openaiApiKey}
                        onChange={(e) => setSettings({
                          ...settings, 
                          integrations: { ...settings.integrations, openaiApiKey: e.target.value }
                        })}
                        placeholder="sk-..." 
                      />
                      <p className="text-xs text-muted-foreground">Stored securely in HashiCorp Vault.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">AI Model</label>
                      <select 
                        className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={settings.integrations.aiModel}
                        onChange={(e) => setSettings({
                          ...settings, 
                          integrations: { ...settings.integrations, aiModel: e.target.value }
                        })}
                      >
                        <option>GPT-4 Turbo (Recommended)</option>
                        <option>GPT-3.5 Turbo</option>
                        <option>Claude 3 Opus</option>
                        <option>Google Gemini Pro</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect shadow-md border-0">
                  <CardHeader>
                    <CardTitle>Slack Notifications</CardTitle>
                    <CardDescription>Receive real-time security alerts directly in your Slack channels.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Slack Webhook URL</label>
                      <Input 
                        type="url" 
                        value={settings.integrations.slackWebhookUrl}
                        onChange={(e) => setSettings({
                          ...settings, 
                          integrations: { ...settings.integrations, slackWebhookUrl: e.target.value }
                        })}
                        placeholder="https://hooks.slack.com/services/..." 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'policies' && (
              <Card className="glass-effect shadow-md border-0 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader>
                  <CardTitle>Global Security Policies</CardTitle>
                  <CardDescription>Configure platform-wide security enforcement rules.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Enforce Pod Security Standards</label>
                      <p className="text-xs text-muted-foreground">Reject pods that don't meet 'restricted' profile.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      checked={settings.securityPolicies.enforcePodSecurity}
                      onChange={(e) => setSettings({
                        ...settings,
                        securityPolicies: { ...settings.securityPolicies, enforcePodSecurity: e.target.checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Restrict External Traffic</label>
                      <p className="text-xs text-muted-foreground">Block all ingress traffic by default unless explicitly allowed.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      checked={settings.securityPolicies.restrictExternalTraffic}
                      onChange={(e) => setSettings({
                        ...settings,
                        securityPolicies: { ...settings.securityPolicies, restrictExternalTraffic: e.target.checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Automatic Image Scanning</label>
                      <p className="text-xs text-muted-foreground">Scan all new images entering the cluster.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      checked={settings.securityPolicies.autoScanImages}
                      onChange={(e) => setSettings({
                        ...settings,
                        securityPolicies: { ...settings.securityPolicies, autoScanImages: e.target.checked }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="glass-effect shadow-md border-0 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader>
                  <CardTitle>Notification Channels & Thresholds</CardTitle>
                  <CardDescription>Choose how and when you want to be notified.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Alert Severity Thresholds</label>
                    <div className="flex gap-4">
                      {['Critical', 'High', 'Medium', 'Low'].map((level) => (
                        <label key={level} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={settings.notifications.thresholds.includes(level)}
                            onChange={(e) => {
                              const newThresholds = e.target.checked 
                                ? [...settings.notifications.thresholds, level]
                                : settings.notifications.thresholds.filter(t => t !== level)
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, thresholds: newThresholds }
                              })
                            }}
                          /> {level}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <label className="text-sm font-medium">Enabled Channels</label>
                    <div className="flex gap-4">
                      {['slack', 'email', 'webhook'].map((channel) => (
                        <label key={channel} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={settings.notifications.channels.includes(channel)}
                            onChange={(e) => {
                              const newChannels = e.target.checked 
                                ? [...settings.notifications.channels, channel]
                                : settings.notifications.channels.filter(c => c !== channel)
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, channels: newChannels }
                              })
                            }}
                          /> {channel}
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
