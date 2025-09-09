"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface AuthMiddlewareProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'USER' | 'SUPER_ADMIN'
  redirectTo?: string
}

export default function AuthMiddleware({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: AuthMiddlewareProps) {
  const { isAuthenticated, isLoading, user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Check authentication
      if (!isAuthenticated || !token) {
        // Clear invalid tokens
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        router.push(redirectTo)
        return
      }

      // Check role-based access
      if (requiredRole && user) {
        const hasAccess = 
          requiredRole === 'USER' || 
          (requiredRole === 'ADMIN' && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)) ||
          (requiredRole === 'SUPER_ADMIN' && user.role === 'SUPER_ADMIN')

        if (!hasAccess) {
          router.push('/dashboard')
          return
        }
      }
    }
  }, [isAuthenticated, isLoading, user, token, requiredRole, redirectTo, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!isAuthenticated || !token) {
    return null
  }

  // Don't render children if role requirement not met
  if (requiredRole && user) {
    const hasAccess = 
      requiredRole === 'USER' || 
      (requiredRole === 'ADMIN' && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)) ||
      (requiredRole === 'SUPER_ADMIN' && user.role === 'SUPER_ADMIN')

    if (!hasAccess) {
      return null
    }
  }

  return <>{children}</>
}