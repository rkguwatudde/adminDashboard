"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock } from 'lucide-react'

interface InactivityContextType {
  isInactive: boolean
  timeUntilTimeout: number
  resetInactivity: () => void
  showWarning: boolean
  dismissWarning: () => void
}

const InactivityContext = createContext<InactivityContextType | undefined>(undefined)

interface InactivityProviderProps {
  children: ReactNode
  timeoutMinutes?: number
  warningMinutes?: number
}

export function InactivityProvider({ 
  children, 
  timeoutMinutes = 20,
  warningMinutes = 2 
}: InactivityProviderProps) {
  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [isInactive, setIsInactive] = useState(false)
  const [timeUntilTimeout, setTimeUntilTimeout] = useState(0)

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningMs = warningMinutes * 60 * 1000

  // Handle inactivity timeout
  const handleTimeout = () => {
    console.log('⏰ InactivityProvider: Session timeout reached')
    setIsInactive(true)
    
    // Clear authentication data
    logout()
    
    // Show session expired message and redirect
    setTimeout(() => {
      router.push('/login?message=session-expired')
    }, 1000)
  }

  // Handle warning timeout
  const handleWarning = () => {
    console.log('⚠️ InactivityProvider: Warning timeout reached')
    setShowWarning(true)
  }

  // Set up inactivity timeout
  const { reset: resetInactivity, getTimeUntilTimeout } = useInactivityTimeout({
    timeout: timeoutMs,
    onTimeout: handleTimeout,
    enabled: isAuthenticated
  })

  // Set up warning timeout
  const { reset: resetWarning } = useInactivityTimeout({
    timeout: timeoutMs - warningMs,
    onTimeout: handleWarning,
    enabled: isAuthenticated && !showWarning
  })

  // Update time until timeout
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      const timeLeft = getTimeUntilTimeout()
      setTimeUntilTimeout(timeLeft)
      
      // Auto-hide warning if user becomes active
      if (timeLeft > warningMs && showWarning) {
        setShowWarning(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, getTimeUntilTimeout, warningMs, showWarning])

  // Reset both timers when user is active
  const handleReset = () => {
    resetInactivity()
    resetWarning()
    setShowWarning(false)
  }

  // Dismiss warning
  const dismissWarning = () => {
    setShowWarning(false)
    handleReset()
  }

  // Format time for display
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const value: InactivityContextType = {
    isInactive,
    timeUntilTimeout,
    resetInactivity: handleReset,
    showWarning,
    dismissWarning
  }

  return (
    <InactivityContext.Provider value={value}>
      {children}
      
      {/* Inactivity Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <DialogTitle>Session Timeout Warning</DialogTitle>
                <DialogDescription>
                  Your session will expire in {formatTime(timeUntilTimeout)} due to inactivity.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>To continue your session, click "Stay Logged In" or perform any action.</p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={dismissWarning}
                className="flex-1"
              >
                Stay Logged In
              </Button>
              <Button 
                onClick={() => {
                  setShowWarning(false)
                  logout()
                  router.push('/login')
                }}
                variant="outline"
                className="flex-1"
              >
                Logout Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </InactivityContext.Provider>
  )
}

export function useInactivity() {
  const context = useContext(InactivityContext)
  if (context === undefined) {
    throw new Error('useInactivity must be used within an InactivityProvider')
  }
  return context
}
