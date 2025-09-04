import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function useAuthGuard(requiredRole?: 'ADMIN' | 'USER' | 'SUPER_ADMIN') {
  const { isAuthenticated, isLoading, user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (!isAuthenticated || !token) {
        // Clear any invalid tokens
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        router.push('/login')
        return
      }

      // Check role-based access if required
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
  }, [isAuthenticated, isLoading, user, token, requiredRole, router])

  return {
    isAuthenticated,
    isLoading,
    user,
    token,
    hasAccess: !isLoading && isAuthenticated && !!token
  }
}
