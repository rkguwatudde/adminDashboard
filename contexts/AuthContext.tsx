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

        console.log('AuthContext: Checking stored data...')
        console.log('Stored token:', storedToken ? 'exists' : 'missing')
        console.log('Stored user:', storedUser ? 'exists' : 'missing')

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            console.log('AuthContext: Parsed user data:', parsedUser)
            
            // Set token and user immediately to avoid redirect loops
            setToken(storedToken)
            setUser(parsedUser)
            console.log('AuthContext: Set token and user from localStorage')
          } catch (parseError) {
            console.error('AuthContext: Error parsing stored user data:', parseError)
            // Clear invalid data
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
          }
          
          // Skip token validation for now to prevent redirects
          // TODO: Re-enable token validation later if needed
        } else {
          console.log('AuthContext: No stored token or user found')
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // Clear invalid data
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
      } finally {
        console.log('AuthContext: Setting isLoading to false')
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

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

        // Store in localStorage
        localStorage.setItem('adminToken', userToken)
        localStorage.setItem('adminUser', JSON.stringify(userData))

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