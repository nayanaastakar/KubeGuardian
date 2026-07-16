'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Project {
  _id: string
  name: string
  description?: string
  environment: 'production' | 'staging' | 'development' | 'testing'
  status: 'active' | 'inactive' | 'archived'
  repository?: string
  team?: string
  tags: string[]
  securityScore?: number
  totalVulnerabilities?: number
  criticalVulnerabilities?: number
  complianceScore?: number
  clusterCount?: number
  lastScanned?: string
  createdAt?: string
}

interface ProjectStore {
  activeProject: Project | null
  projects: Project[]
  setActiveProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  clearActiveProject: () => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      activeProject: null,
      projects: [],
      setActiveProject: (project) => set({ activeProject: project }),
      setProjects: (projects) => set({ projects }),
      clearActiveProject: () => set({ activeProject: null }),
    }),
    {
      name: 'kubeguardian-project',
      partialize: (state) => ({ activeProject: state.activeProject }),
    }
  )
)
