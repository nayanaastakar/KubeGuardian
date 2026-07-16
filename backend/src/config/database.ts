import mongoose from 'mongoose'
import { logger } from '@/utils/logger'

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kubeguardian'

const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
}

export async function connectDatabase() {
  try {
    await mongoose.connect(mongoUri, mongoOptions)
    logger.info('✅ MongoDB connected successfully')
    
    // Set up connection event listeners
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error)
    })
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected')
    })
    
    return mongoose.connection
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error)
    throw error
  }
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    const state = mongoose.connection.readyState
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
    
    return { 
      status: states[state] || 'unknown', 
      timestamp: new Date().toISOString(),
      readyState: state
    }
  } catch (error) {
    logger.error('Database health check failed:', error)
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() }
  }
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    await mongoose.connection.close()
    logger.info('MongoDB connection closed')
  } catch (error) {
    logger.error('Error closing MongoDB:', error)
  }
}

export { mongoose }
