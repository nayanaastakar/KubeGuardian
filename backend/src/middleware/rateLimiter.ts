import { RateLimiterMemory } from 'rate-limiter-flexible'
import { Request, Response, NextFunction } from 'express'
import { CustomError } from './errorHandler'

// General API rate limiter
const rateLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if limit exceeded
})

// Authentication rate limiter (stricter)
const authLimiter = new RateLimiterMemory({
  points: 5, // Number of login attempts
  duration: 900, // Per 15 minutes
  blockDuration: 900, // Block for 15 minutes if limit exceeded
})

// API key rate limiter
const apiKeyLimiter = new RateLimiterMemory({
  points: 1000, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if limit exceeded
})

export function rateLimitMiddleware(limiter: RateLimiterMemory, keyExtractor?: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyExtractor ? keyExtractor(req) : (req.ip || 'unknown')
      await limiter.consume(key)
      next()
    } catch (rejRes: any) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1
      res.set('Retry-After', String(secs))
      
      throw new CustomError(
        `Too many requests. Try again in ${secs} seconds.`,
        429
      )
    }
  }
}

// Export different limiters for different routes
export { rateLimiter, authLimiter, apiKeyLimiter }

// Default rate limiter middleware
export const rateLimiterMiddleware = rateLimitMiddleware(rateLimiter)
export const authRateLimiterMiddleware = rateLimitMiddleware(authLimiter)
export const apiKeyRateLimiterMiddleware = rateLimitMiddleware(apiKeyLimiter, (req: Request) => {
  const apiKey = req.headers['x-api-key'] as string
  return apiKey || req.ip || 'unknown'
})
