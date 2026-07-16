import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '@/models/User'
import { asyncHandler, CustomError } from '@/middleware/errorHandler'
import { authRateLimiterMiddleware } from '@/middleware/rateLimiter'
import { logger } from '@/utils/logger'
import { authMiddleware } from '@/middleware/auth'

const router = Router()

// Register user
router.post('/register', authRateLimiterMiddleware, asyncHandler(async (req, res) => {
  const { email, password, name, role = 'viewer' } = req.body

  // Validation
  if (!email || !password || !name) {
    throw new CustomError('Email, password, and name are required', 400)
  }

  if (password.length < 8) {
    throw new CustomError('Password must be at least 8 characters long', 400)
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    throw new CustomError('User with this email already exists', 409)
  }

  // Create user (password will be hashed by pre-save hook)
  const user = new User({
    email: email.toLowerCase(),
    password,
    name,
    role
  })

  await user.save()

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  )

  logger.info(`User registered: ${email}`)

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    }
  })
}))

// Login user
router.post('/login', authRateLimiterMiddleware, asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Validation
  if (!email || !password) {
    throw new CustomError('Email and password are required', 400)
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    throw new CustomError('Invalid credentials', 401)
  }

  // Verify password
  const isValidPassword = await user.comparePassword(password)
  if (!isValidPassword) {
    throw new CustomError('Invalid credentials', 401)
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  )

  logger.info(`User logged in: ${email}`)

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    }
  })
}))

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { token } = req.body

  if (!token) {
    throw new CustomError('Refresh token is required', 400)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    // Get fresh user data
    const user = await User.findById(decoded.userId)
    if (!user) {
      throw new CustomError('User not found', 404)
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    )

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  } catch (error) {
    throw new CustomError('Invalid refresh token', 401)
  }
}))

// Get current user
router.get('/me', authMiddleware, asyncHandler(async (req: any, res) => {
  const user = await User.findById(req.user.id)
  
  if (!user) {
    throw new CustomError('User not found', 404)
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  })
}))

// Update current user profile
router.patch('/me', authMiddleware, asyncHandler(async (req: any, res) => {
  const user = await User.findById(req.user.id)
  
  if (!user) {
    throw new CustomError('User not found', 404)
  }

  const { name, email, password } = req.body

  if (name) user.name = name
  if (email) user.email = email.toLowerCase()
  if (password) {
    if (password.length < 8) {
      throw new CustomError('Password must be at least 8 characters long', 400)
    }
    user.password = password // Will be hashed by pre-save hook
  }

  await user.save()

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      updatedAt: user.updatedAt
    }
  })
}))

export default router
