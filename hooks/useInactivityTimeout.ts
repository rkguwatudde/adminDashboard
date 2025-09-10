"use client"

import { useEffect, useRef, useCallback } from 'react'

interface UseInactivityTimeoutOptions {
  timeout: number // in milliseconds
  onTimeout: () => void
  events?: string[]
  element?: HTMLElement | Document | Window
  enabled?: boolean
}

/**
 * Custom hook for tracking user inactivity and triggering timeout
 * Tracks mouse movement, clicks, key presses, and other user interactions
 */
export function useInactivityTimeout({
  timeout = 20 * 60 * 1000, // 20 minutes default
  onTimeout,
  events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown',
    'wheel'
  ],
  element = document,
  enabled = true
}: UseInactivityTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const isActiveRef = useRef<boolean>(true)

  // Reset the timeout timer
  const resetTimeout = useCallback(() => {
    if (!enabled) return

    console.log('🕐 InactivityTimeout: Activity detected, resetting timer')
    lastActivityRef.current = Date.now()
    isActiveRef.current = true

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ InactivityTimeout: Timeout reached, triggering logout')
      isActiveRef.current = false
      onTimeout()
    }, timeout)
  }, [timeout, onTimeout, enabled])

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (!enabled || !isActiveRef.current) return
    resetTimeout()
  }, [resetTimeout, enabled])

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return

    console.log('🕐 InactivityTimeout: Setting up activity tracking')
    
    // Add event listeners
    events.forEach(event => {
      element.addEventListener(event, handleActivity, { passive: true })
    })

    // Initial timeout setup
    resetTimeout()

    // Cleanup function
    return () => {
      console.log('🕐 InactivityTimeout: Cleaning up event listeners')
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Remove event listeners
      events.forEach(event => {
        element.removeEventListener(event, handleActivity)
      })
    }
  }, [events, element, handleActivity, resetTimeout, enabled])

  // Manual reset function (useful for API calls or other activities)
  const reset = useCallback(() => {
    console.log('🕐 InactivityTimeout: Manual reset triggered')
    resetTimeout()
  }, [resetTimeout])

  // Get time until timeout
  const getTimeUntilTimeout = useCallback(() => {
    const timeSinceLastActivity = Date.now() - lastActivityRef.current
    return Math.max(0, timeout - timeSinceLastActivity)
  }, [timeout])

  // Check if user is currently active
  const isActive = useCallback(() => {
    return isActiveRef.current
  }, [])

  return {
    reset,
    getTimeUntilTimeout,
    isActive,
    lastActivity: lastActivityRef.current
  }
}
