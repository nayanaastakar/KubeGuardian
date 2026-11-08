import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { CustomError } from './errorHandler'

export interface AuthenticatedUser {
  id: string
  email: string
  role: 'admin' | 'devops_engineer' | 'security_analyst' | 'viewer'
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  // Allow development/demo bypass if configured or in testing without token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_ANONYMOUS_DEV === 'true') {
      req.user = {
        id: 'dev-admin-id',
        email: 'admin@kubeguardian.local',
        role: 'admin'
      }
      return next()
    }
    throw new CustomError('Authorization token is required', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role || 'viewer'
    }
    next()
  } catch (error) {
    throw new CustomError('Invalid or expired token', 401)
  }
}

export const requireRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401)
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new CustomError(`Forbidden: Access requires one of [${allowedRoles.join(', ')}] role`, 403)
    }

    next()
  }
}
