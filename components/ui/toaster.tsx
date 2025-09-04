"use client"

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Toast, ToastClose, ToastDescription, ToastTitle } from './toast'
import { useToast } from '@/contexts/ToastContext'

export function Toaster() {
  const { toasts } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant}>
          <div className="flex-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </div>
          <ToastClose />
        </Toast>
      ))}
    </div>,
    document.body
  )
}
