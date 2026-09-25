import { logger } from '@/utils/logger'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

type RedisClient = ReturnType<typeof import('redis').createClient>

let redisClientInstance: RedisClient | undefined

function getRedisClient() {
  if (!redisClientInstance) {
    const { createClient } = require('redis') as typeof import('redis')

    redisClientInstance = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    })
  }

  return redisClientInstance
}

export const redisClient = new Proxy({} as RedisClient, {
  get(_target, prop) {
    return getRedisClient()[prop as keyof RedisClient]
  }
})

export async function connectRedis() {
  try {
    const client = getRedisClient()

    await client.connect()
    logger.info('✅ Redis connected successfully')
    
    // Test connection
    await client.ping()
    logger.info('✅ Redis ping successful')
    
    return client
  } catch (error) {
    logger.error('❌ Redis connection failed:', error)
    throw error
  }
}

// Redis health check
export async function checkRedisHealth() {
  try {
    await getRedisClient().ping()
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    logger.error('Redis health check failed:', error)
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() }
  }
}

// Graceful shutdown
export async function closeRedis() {
  try {
    if (!redisClientInstance) {
      return
    }

    await redisClientInstance.quit()
    logger.info('Redis connection closed')
  } catch (error) {
    logger.error('Error closing Redis:', error)
  }
}
