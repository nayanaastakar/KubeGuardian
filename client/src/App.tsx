import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Route, Routes, Navigate } from 'react-router-dom'
import { OverviewPage } from './pages/OverviewPage'
import { ClusterMonitoringPage } from './pages/ClusterMonitoringPage'
import { VulnerabilitiesPage } from './pages/VulnerabilitiesPage'
import { IncidentCenterPage } from './pages/IncidentCenterPage'
import { AIAssistantPage } from './pages/AIAssistantPage'
import { ChaosEngineeringPage } from './pages/ChaosEngineeringPage'
import { SecurityScoringPage } from './pages/SecurityScoringPage'
import { SettingsPage } from './pages/SettingsPage'
import { Sidebar } from './components/ui/Sidebar'
import { TopNav } from './components/ui/TopNav'
import { useUiStore } from './store/uiStore'

const queryClient = new QueryClient()

function App() {
  const isDarkMode = useUiStore((state) => state.darkMode)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('theme-dark', isDarkMode)
    root.classList.toggle('theme-light', !isDarkMode)
  }, [isDarkMode])

  return (
    <QueryClientProvider client={queryClient}>
      <div className={isDarkMode ? 'theme-dark dark' : 'theme-light'}>
        <div className="app-shell min-h-screen bg-white text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
          <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar />
            <div className="min-w-0 flex-1 p-3 sm:p-5 lg:p-8">
              <TopNav />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-6"
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/overview" replace />} />
                  <Route path="/overview" element={<OverviewPage />} />
                  <Route path="/clusters" element={<ClusterMonitoringPage />} />
                  <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
                  <Route path="/incidents" element={<IncidentCenterPage />} />
                  <Route path="/ai-assistant" element={<AIAssistantPage />} />
                  <Route path="/chaos" element={<ChaosEngineeringPage />} />
                  <Route path="/security" element={<SecurityScoringPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/overview" replace />} />
                </Routes>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
