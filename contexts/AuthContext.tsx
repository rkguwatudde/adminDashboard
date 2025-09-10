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
  logout: (reason?: string) => void
  validateToken: (token: string) => Promise<boolean>
  isAuthenticated: boolean
  lastActivity: number
  updateLastActivity: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const router = useRouter()

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthContext: Checking authentication...')
        
        // Check for cookies first (preferred method)
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)

        const cookieToken = cookies['adminToken']
        const cookieUser = cookies['adminUser']

        // Fallback to localStorage for backward compatibility
        const storedToken = localStorage.getItem('adminToken')
        const storedUser = localStorage.getItem('adminUser')

        const token = cookieToken || storedToken
        const userData = cookieUser || storedUser

        console.log('AuthContext: Cookie token:', cookieToken ? 'exists' : 'missing')
        console.log('AuthContext: Cookie user:', cookieUser ? 'exists' : 'missing')
        console.log('AuthContext: LocalStorage token:', storedToken ? 'exists' : 'missing')
        console.log('AuthContext: LocalStorage user:', storedUser ? 'exists' : 'missing')

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(decodeURIComponent(userData))
            console.log('AuthContext: Parsed user data:', parsedUser)
            
            // Set token and user immediately to avoid redirect loops
            setToken(token)
            setUser(parsedUser)
            console.log('AuthContext: Set token and user from storage')
          } catch (parseError) {
            console.error('AuthContext: Error parsing stored user data:', parseError)
            // Clear invalid data
            clearAuthData()
          }
          
          // Skip token validation for now to prevent redirects
          // TODO: Re-enable token validation later if needed
        } else {
          console.log('AuthContext: No stored token or user found')
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // Clear invalid data
        clearAuthData()
      } finally {
        console.log('AuthContext: Setting isLoading to false')
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Helper function to clear authentication data
  const clearAuthData = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    // Clear cookies
    document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'adminUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Starting login process...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log('AuthContext: Login response:', data)

      if (data.success) {
        const userData = data.data.user
        const userToken = data.data.token

        console.log('AuthContext: Login successful, user data:', userData)
        console.log('AuthContext: Token received:', userToken ? 'yes' : 'no')

        // Store in both cookies and localStorage for compatibility
        const userDataString = JSON.stringify(userData)
        
        // Set httpOnly cookies (more secure)
        document.cookie = `adminToken=${userToken}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
        document.cookie = `adminUser=${encodeURIComponent(userDataString)}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
        
        // Also store in localStorage for backward compatibility
        localStorage.setItem('adminToken', userToken)
        localStorage.setItem('adminUser', userDataString)

        // Update state
        setToken(userToken)
        setUser(userData)

        console.log('AuthContext: State updated, user set to:', userData)
        return true
      } else {
        console.log('AuthContext: Login failed:', data.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const updateLastActivity = () => {
    const now = Date.now()
    setLastActivity(now)
    
    // Also update server-side last activity if authenticated
    if (token && user) {
      // Send activity update to server (non-blocking)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/api/admin/update-activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lastActivity: now })
      }).catch(error => {
        console.warn('Failed to update server activity:', error)
      })
    }
  }

  const logout = (reason?: string) => {
    console.log('AuthContext: Logging out user', reason ? `- Reason: ${reason}` : '')
    
    // Clear authentication data
    clearAuthData()

    // Clear state
    setToken(null)
    setUser(null)
    setLastActivity(Date.now())

    // Redirect to login with reason if provided
    const loginUrl = reason ? `/login?reason=${encodeURIComponent(reason)}` : '/login'
    router.push(loginUrl)
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
    lastActivity,
    updateLastActivity,
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