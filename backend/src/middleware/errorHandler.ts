import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export class CustomError extends Error implements AppError {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal Server Error'

  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    if (!error.isOperational) {
      message = 'Something went wrong'
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: error.stack,
      details: error 
    })
  })
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
