import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

import { errorHandler } from '@/middleware/errorHandler'
import { rateLimiterMiddleware } from '@/middleware/rateLimiter'
import { requestSanitizer } from '@/middleware/requestSanitizer'
import { logger } from '@/utils/logger'
import { connectDatabase, checkDatabaseHealth } from '@/config/database'
import { connectRedis } from '@/config/redis'
import { setupKubernetesClient, getClusterInfo, getPods } from '@/kubernetes/client'

// Import routes
import authRoutes from '@/routes/auth'
import clusterRoutes from '@/routes/clusters'
import securityRoutes from '@/routes/security'
import scanRoutes from '@/routes/scans'
import alertsRoutes from '@/routes/alerts'
import metricsRoutes from '@/routes/metrics'
import aiRoutes from '@/routes/ai'
import complianceRoutes from '@/routes/compliance'
import remediationRoutes from '@/routes/remediation'
import rbacRoutes from '@/routes/rbac'
import networkRoutes from '@/routes/networkSecurity'
import settingsRoutes from '@/routes/settings'
import optimizationRoutes from '@/routes/optimization'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  process.env.FRONTEND_URL
].filter(Boolean) as string[]

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }
})

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}))

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl) or if origin is in whitelist
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

app.use(compression())
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(requestSanitizer)
app.use(rateLimiterMiddleware)

// Browser-friendly backend status page
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>KubeGuardian DevSecOps Platform</title>
        <style>
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #090d16;
            color: #f1f5f9;
          }
          main {
            max-width: 580px;
            margin: 80px auto;
            padding: 32px;
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 16px;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
          }
          h1 { margin: 0 0 12px; font-size: 24px; color: #38bdf8; }
          p { margin: 8px 0; color: #94a3b8; }
          a { color: #38bdf8; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .badge { display: inline-block; padding: 4px 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-radius: 6px; font-size: 13px; margin-top: 12px; }
        </style>
      </head>
      <body>
        <main>
          <h1>🛡️ KubeGuardian AI Platform</h1>
          <p>Cloud Native DevSecOps Automation & Remediation API</p>
          <div class="badge">Status: Online & Operational</div>
          <p style="margin-top: 20px;">Health Endpoint: <a href="/health">/health</a></p>
          <p>Frontend Dashboard: <a href="http://localhost:3000">http://localhost:3000</a></p>
        </main>
      </body>
    </html>
  `)
})

// Comprehensive Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth()
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    database: dbHealth,
    realtime: {
      socketClients: io.engine.clientsCount
    }
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/clusters', clusterRoutes)
app.use('/api/security', securityRoutes)
app.use('/api/scans', scanRoutes)
app.use('/api/alerts', alertsRoutes)
app.use('/api/metrics', metricsRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/compliance', complianceRoutes)
app.use('/api/remediation', remediationRoutes)
app.use('/api/rbac', rbacRoutes)
app.use('/api/network', networkRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/optimization', optimizationRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

// Error handling middleware
app.use(errorHandler)

// Socket.IO real-time telemetry streaming
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)

  socket.on('join-cluster', (clusterId: string) => {
    socket.join(`cluster-${clusterId}`)
    logger.info(`Client ${socket.id} joined cluster ${clusterId}`)
  })

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Background real-time telemetry emitter
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      if (io.engine.clientsCount > 0) {
        const [clusterInfo, pods] = await Promise.all([getClusterInfo(), getPods()])
        const runningPods = pods.filter((p: any) => p.status?.phase === 'Running').length
        io.emit('telemetry:stream', {
          clusterId: 'cl-live-01',
          nodeCount: clusterInfo.nodeCount,
          podCount: pods.length,
          runningPods,
          timestamp: new Date().toISOString()
        })
      }
    } catch {}
  }, 5000)
}

app.set('io', io)

const PORT = process.env.PORT || 8000

async function startServer() {
  try {
    // Attempt database and k8s connection
    try {
      await connectDatabase()
    } catch {
      logger.warn('Running with In-Memory Database store')
    }

    try {
      await connectRedis()
    } catch {
      logger.warn('Redis unavailable, using local memory rate limiter')
    }

    try {
      await setupKubernetesClient()
    } catch {
      logger.warn('Running with Safe Virtual Kubernetes cluster')
    }

    server.listen(PORT, () => {
      logger.info(`🚀 KubeGuardian AI Platform running on port ${PORT}`)
      logger.info(`📊 Health check available at http://localhost:${PORT}/health`)
      logger.info(`🔌 Socket.IO server ready for real-time streaming`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => process.exit(0))
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => process.exit(0))
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

if (process.env.NODE_ENV !== 'test') {
  startServer()
}

export { app, io, server }
