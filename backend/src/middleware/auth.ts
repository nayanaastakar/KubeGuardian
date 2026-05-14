import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { CustomError } from './errorHandler'

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError('Authorization token is required', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
    next()
  } catch (error) {
    throw new CustomError('Invalid or expired token', 401)
  }
}
