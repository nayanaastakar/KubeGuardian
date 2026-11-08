import mongoose from 'mongoose'
import { logger } from '@/utils/logger'

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27018/kubeguardian'

mongoose.set('sanitizeFilter', true)
mongoose.set('bufferCommands', false)

const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 15000,
  bufferCommands: false,
}

let isConnecting = false

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (isConnecting) return mongoose.connection

  try {
    isConnecting = true
    await mongoose.connect(mongoUri, mongoOptions)
    logger.info('✅ MongoDB connected successfully to ' + mongoUri)

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected - switching to active in-memory repository fallback')
    })

    return mongoose.connection
  } catch (error: any) {
    logger.warn(`⚠️ MongoDB connection unavailable (${error.message}). Running with autonomous In-Memory data engine.`)
    return null
  } finally {
    isConnecting = false
  }
}

export async function checkDatabaseHealth() {
  try {
    const state = mongoose.connection.readyState
    const states = {
      0: 'disconnected (using in-memory engine)',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }

    return {
      status: state === 1 ? 'healthy' : 'degraded-in-memory',
      timestamp: new Date().toISOString(),
      readyState: state,
      mode: state === 1 ? 'mongodb' : 'memory-store',
      description: states[state] || 'unknown'
    }
  } catch (error: any) {
    return {
      status: 'degraded-in-memory',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

export async function closeDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
      logger.info('MongoDB connection closed')
    }
  } catch (error) {
    logger.error('Error closing MongoDB:', error)
  }
}

export { mongoose }
