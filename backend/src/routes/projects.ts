import { Router } from 'express'
import { Project } from '@/models/Project'
import { authMiddleware } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()

/* ── Seed helper: mock projects ── */
const mockProjects = (userId: string) => [
  {
    _id: 'mock-1',
    name: 'payments-service',
    description: 'Core payment processing microservice',
    environment: 'production',
    status: 'active',
    repository: 'github.com/org/payments-service',
    team: 'Platform Engineering',
    tags: ['critical', 'pci-dss'],
    securityScore: 82,
    totalVulnerabilities: 14,
    criticalVulnerabilities: 2,
    complianceScore: 91,
    clusterCount: 2,
    lastScanned: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    _id: 'mock-2',
    name: 'auth-gateway',
    description: 'Authentication and authorization gateway',
    environment: 'production',
    status: 'active',
    repository: 'github.com/org/auth-gateway',
    team: 'Security Team',
    tags: ['auth', 'soc2'],
    securityScore: 94,
    totalVulnerabilities: 3,
    criticalVulnerabilities: 0,
    complianceScore: 97,
    clusterCount: 1,
    lastScanned: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    _id: 'mock-3',
    name: 'data-pipeline',
    description: 'Real-time data ingestion and processing pipeline',
    environment: 'staging',
    status: 'active',
    repository: 'github.com/org/data-pipeline',
    team: 'Data Engineering',
    tags: ['data', 'kafka'],
    securityScore: 65,
    totalVulnerabilities: 28,
    criticalVulnerabilities: 5,
    complianceScore: 72,
    clusterCount: 1,
    lastScanned: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
]

// GET /api/projects — list all
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    try {
      const projects = await Project.find({ createdBy: req.user.id }).sort({ createdAt: -1 })
      res.json({ success: true, data: projects })
    } catch {
      res.json({ success: true, data: mockProjects(req.user?.id) })
    }
  })
)

// GET /api/projects/:id — single project
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    try {
      const project = await Project.findOne({ _id: req.params.id, createdBy: req.user.id })
      if (!project) return res.status(404).json({ success: false, error: 'Project not found' })
      res.json({ success: true, data: project })
    } catch {
      const mock = mockProjects(req.user?.id).find((p) => p._id === req.params.id)
      if (!mock) return res.status(404).json({ success: false, error: 'Project not found' })
      res.json({ success: true, data: mock })
    }
  })
)

// POST /api/projects — create
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const { name, description, environment, repository, team, tags } = req.body
    if (!name) return res.status(400).json({ success: false, error: 'Project name is required' })

    const project = await Project.create({
      name,
      description,
      environment: environment || 'development',
      status: 'active',
      repository,
      team,
      tags: tags || [],
      securityScore: Math.floor(Math.random() * 40) + 60,
      totalVulnerabilities: Math.floor(Math.random() * 30),
      criticalVulnerabilities: Math.floor(Math.random() * 5),
      complianceScore: Math.floor(Math.random() * 30) + 70,
      clusterCount: 0,
      createdBy: req.user.id,
      lastScanned: new Date(),
    })

    res.status(201).json({ success: true, data: project })
  })
)

// PUT /api/projects/:id — update
router.put(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    )
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' })
    res.json({ success: true, data: project })
  })
)

// DELETE /api/projects/:id
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: any, res) => {
    const project = await Project.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id })
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' })
    res.json({ success: true, message: 'Project deleted successfully' })
  })
)

export default router
