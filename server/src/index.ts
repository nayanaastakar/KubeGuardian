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
import { connectDatabase } from '@/config/database'
import { connectRedis } from '@/config/redis'
import { setupKubernetesClient } from '@/kubernetes/client'

// Import routes
import authRoutes from '@/routes/auth'
import clusterRoutes from '@/routes/clusters'
import securityRoutes from '@/routes/security'
import scanRoutes from '@/routes/scans'
import alertsRoutes from '@/routes/alerts'
import metricsRoutes from '@/routes/metrics'
import aiRoutes from '@/routes/ai'
import complianceRoutes from '@/routes/compliance'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
        <title>KubeGuardian Backend</title>
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f7fafc;
            color: #111827;
          }
          main {
            max-width: 520px;
            margin: 80px auto;
            padding: 28px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
          }
          h1 {
            margin: 0 0 12px;
            font-size: 24px;
          }
          p {
            margin: 8px 0;
            color: #4b5563;
          }
          a {
            color: #2563eb;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>KubeGuardian Backend is running</h1>
          <p>API server: http://localhost:${PORT}</p>
          <p>Health check: <a href="/health">/health</a></p>
          <p>Frontend: <a href="http://localhost:3000/overview">http://localhost:3000/overview</a></p>
        </main>
      </body>
    </html>
  `)
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)

  // Join cluster-specific rooms
  socket.on('join-cluster', (clusterId: string) => {
    socket.join(`cluster-${clusterId}`)
    logger.info(`Client ${socket.id} joined cluster ${clusterId}`)
  })

  // Leave cluster rooms
  socket.on('leave-cluster', (clusterId: string) => {
    socket.leave(`cluster-${clusterId}`)
    logger.info(`Client ${socket.id} left cluster ${clusterId}`)
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Make io available throughout the app
app.set('io', io)

// Start server
const PORT = process.env.PORT || 8000

/** In production, all dependencies must connect. In other modes (typical local `npm run dev`), start the API even if Mongo/Redis/K8s are offline so the UI dev server is not the only thing users troubleshoot. */
const requireFullStack = process.env.NODE_ENV === 'production'
const connectOptionalServices = process.env.CONNECT_OPTIONAL_SERVICES === 'true'

async function startServer() {
  try {
    if (requireFullStack || connectOptionalServices) {
      await connectDatabase()
      await connectRedis()
      await setupKubernetesClient()
    } else {
      logger.warn('Optional MongoDB, Redis, and Kubernetes connections skipped for local dev startup.')
      logger.warn('Set CONNECT_OPTIONAL_SERVICES=true to connect real infrastructure services.')
      if (process.env.CONNECT_OPTIONAL_SERVICES === 'legacy') {
      try {
        await connectDatabase()
      } catch {
        logger.warn('MongoDB not available — API persistence features will fail until MongoDB is running.')
      }
      try {
        await connectRedis()
      } catch {
        logger.warn('Redis not available — rate limiting / cache features may fail until Redis is running.')
      }
      try {
        await setupKubernetesClient()
      } catch {
        logger.warn('Kubernetes client not available — cluster API routes will fail until a valid kubeconfig is present.')
      }
    }

    }

    server.listen(PORT, () => {
      logger.info(`🚀 KubeGuardian AI Backend Server running on port ${PORT}`)
      logger.info(`📊 Health check available at http://localhost:${PORT}/health`)
      logger.info(`🔌 Socket.IO server ready for real-time connections`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

startServer()

export { app, io }
