import { createClient } from 'redis'
import { logger } from '@/utils/logger'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
})

export async function connectRedis() {
  try {
    await redisClient.connect()
    logger.info('✅ Redis connected successfully')
    
    // Test connection
    await redisClient.ping()
    logger.info('✅ Redis ping successful')
    
    return redisClient
  } catch (error) {
    logger.error('❌ Redis connection failed:', error)
    throw error
  }
}

// Redis health check
export async function checkRedisHealth() {
  try {
    await redisClient.ping()
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    logger.error('Redis health check failed:', error)
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() }
  }
}

// Graceful shutdown
export async function closeRedis() {
  try {
    await redisClient.quit()
    logger.info('Redis connection closed')
  } catch (error) {
    logger.error('Error closing Redis:', error)
  }
}
