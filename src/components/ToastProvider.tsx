'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Alert, AlertTitle, AlertDescription, AlertActions } from '../../sample/alert'
import { Button } from '../../sample/button'

interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto-hide after duration (default 4 seconds)
    const duration = toast.duration ?? 4000
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id)
      }, duration)
    }
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  const getToastColors = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 ring-green-200 dark:bg-green-900/20 dark:ring-green-800'
      case 'error':
        return 'bg-red-50 ring-red-200 dark:bg-red-900/20 dark:ring-red-800'
      case 'warning':
        return 'bg-yellow-50 ring-yellow-200 dark:bg-yellow-900/20 dark:ring-yellow-800'
      case 'info':
      default:
        return 'bg-blue-50 ring-blue-200 dark:bg-blue-900/20 dark:ring-blue-800'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            open={true}
            onClose={() => hideToast(toast.id)}
            size="sm"
            className={`${getToastColors(toast.type)} shadow-lg w-full max-w-none`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">
                {getToastIcon(toast.type)}
              </span>
              <div className="flex-1 min-w-0">
                <AlertTitle className="text-left text-sm font-medium">
                  {toast.title}
                </AlertTitle>
                {toast.description && (
                  <AlertDescription className="text-left text-xs mt-1">
                    {toast.description}
                  </AlertDescription>
                )}
              </div>
              <Button
                plain
                onClick={() => hideToast(toast.id)}
                className="flex-shrink-0 p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                ✕
              </Button>
            </div>
          </Alert>
        ))}
      </div>
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
