"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
}

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant || 'default',
      duration: options.duration || 5000,
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, newToast.duration)

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
