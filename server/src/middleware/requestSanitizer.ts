import { Request, Response, NextFunction } from 'express'
import { CustomError } from '@/middleware/errorHandler'

const blockedKeys = new Set(['__proto__', 'prototype', 'constructor'])

function hasUnsafeMongoKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false
  }

  if (Array.isArray(value)) {
    return value.some(hasUnsafeMongoKey)
  }

  for (const [key, childValue] of Object.entries(value as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.') || blockedKeys.has(key)) {
      return true
    }

    if (hasUnsafeMongoKey(childValue)) {
      return true
    }
  }

  return false
}

export function requestSanitizer(req: Request, _res: Response, next: NextFunction) {
  if (hasUnsafeMongoKey(req.body) || hasUnsafeMongoKey(req.query) || hasUnsafeMongoKey(req.params)) {
    return next(new CustomError('Request contains unsafe query keys', 400))
  }

  return next()
}
