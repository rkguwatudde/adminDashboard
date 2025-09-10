import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface User {
  id: string
  email: string
  role: 'ADMIN' | 'USER' | 'SUPER_ADMIN'
}

interface AuthResult {
  user: User | null
  token: string | null
  isValid: boolean
  error?: string
}

/**
 * Server-side authentication utility for API routes
 * Validates JWT tokens from cookies or Authorization headers
 */
export function getServerAuth(request: NextRequest): AuthResult {
  try {
    // Try to get token from cookies first
    let token = request.cookies.get('adminToken')?.value
    
    // Fallback to Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    if (!token) {
      return {
        user: null,
        token: null,
        isValid: false,
        error: 'No authentication token found'
      }
    }
    
    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // Validate token structure
      if (!decoded.userId || !decoded.email || !decoded.role) {
        return {
          user: null,
          token: null,
          isValid: false,
          error: 'Invalid token structure'
        }
      }
      
      const user: User = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
      
      return {
        user,
        token,
        isValid: true
      }
      
    } catch (jwtError) {
      return {
        user: null,
        token: null,
        isValid: false,
        error: 'Invalid or expired token'
      }
    }
    
  } catch (error) {
    return {
      user: null,
      token: null,
      isValid: false,
      error: 'Authentication error'
    }
  }
}

/**
 * Middleware function for API routes that require authentication
 */
export function requireAuth(request: NextRequest): User {
  const auth = getServerAuth(request)
  
  if (!auth.isValid || !auth.user) {
    throw new Error(auth.error || 'Authentication required')
  }
  
  return auth.user
}

/**
 * Middleware function for API routes that require specific roles
 */
export function requireRole(request: NextRequest, allowedRoles: string[]): User {
  const user = requireAuth(request)
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`)
  }
  
  return user
}

/**
 * Check if user has admin privileges
 */
export function requireAdmin(request: NextRequest): User {
  return requireRole(request, ['ADMIN', 'SUPER_ADMIN'])
}

/**
 * Check if user has super admin privileges
 */
export function requireSuperAdmin(request: NextRequest): User {
  return requireRole(request, ['SUPER_ADMIN'])
}
