"use client"

import { useAuthGuard } from '@/hooks/useAuthGuard'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'USER' | 'SUPER_ADMIN'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isLoading, hasAccess } = useAuthGuard(requiredRole)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
