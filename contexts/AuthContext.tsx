"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  role: 'ADMIN' | 'USER' | 'SUPER_ADMIN'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  validateToken: (token: string) => Promise<boolean>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('adminToken')
        const storedUser = localStorage.getItem('adminUser')

        if (storedToken && storedUser) {
          // Validate token with backend
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/admin/validate-token`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
              },
            })

            if (response.ok) {
              const data = await response.json()
              if (data.success) {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
              } else {
                // Token invalid, clear storage
                localStorage.removeItem('adminToken')
                localStorage.removeItem('adminUser')
              }
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('adminToken')
              localStorage.removeItem('adminUser')
            }
          } catch (error) {
            console.error('Token validation error:', error)
            // Clear invalid data
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // Clear invalid data
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        const userData = data.data.user
        const userToken = data.data.token

        // Store in localStorage
        localStorage.setItem('adminToken', userToken)
        localStorage.setItem('adminUser', JSON.stringify(userData))

        // Update state
        setToken(userToken)
        setUser(userData)

        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')

    // Clear state
    setToken(null)
    setUser(null)

    // Redirect to login
    router.push('/login')
  }

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/admin/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.success
      }
      return false
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    validateToken,
    isAuthenticated: !!token && !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
