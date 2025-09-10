"use client"

import { useEffect, useState, ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
}

export function AuthGuard({ 
  children, 
  fallback, 
  requireAuth = true,
  allowedRoles = []
}: AuthGuardProps) {
  const { user, token, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(true)
  const [checkError, setCheckError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log('🛡️ AuthGuard: Starting authentication check')
        console.log('🛡️ AuthGuard: isLoading:', isLoading)
        console.log('🛡️ AuthGuard: isAuthenticated:', isAuthenticated)
        console.log('🛡️ AuthGuard: user:', user)
        console.log('🛡️ AuthGuard: token exists:', !!token)

        // Wait for AuthContext to finish loading
        if (isLoading) {
          console.log('🛡️ AuthGuard: Still loading, waiting...')
          return
        }

        // If authentication is not required, allow access
        if (!requireAuth) {
          console.log('🛡️ AuthGuard: Authentication not required, allowing access')
          setIsChecking(false)
          return
        }

        // Check if user is authenticated
        if (!isAuthenticated || !user || !token) {
          console.log('🛡️ AuthGuard: User not authenticated, redirecting to login')
          
          // Get the current path for redirect after login
          const currentPath = window.location.pathname
          const redirectUrl = currentPath !== '/login' ? currentPath : '/dashboard'
          
          // Redirect to login with return URL
          router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
          return
        }

        // Check role-based access if roles are specified
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          console.log('🛡️ AuthGuard: User role not allowed:', user.role)
          setCheckError(`Access denied. Required roles: ${allowedRoles.join(', ')}`)
          setIsChecking(false)
          return
        }

        console.log('✅ AuthGuard: Authentication successful, allowing access')
        setIsChecking(false)

      } catch (error) {
        console.error('🛡️ AuthGuard: Error during authentication check:', error)
        setCheckError('Authentication check failed')
        setIsChecking(false)
      }
    }

    checkAuthentication()
  }, [isLoading, isAuthenticated, user, token, requireAuth, allowedRoles, router])

  // Show loading state
  if (isLoading || isChecking) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Verifying Access</CardTitle>
            <CardDescription>
              Please wait while we verify your authentication...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Show error state
  if (checkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Access Denied</CardTitle>
            <CardDescription className="text-red-700">
              {checkError}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => router.push('/login')}
              variant="outline"
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If authentication is not required or user is authenticated, render children
  if (!requireAuth || (isAuthenticated && user && token)) {
    return <>{children}</>
  }

  // Fallback (should not reach here)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please log in to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Higher-order component for easier usage
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
