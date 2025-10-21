import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'

interface ToastType {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface ToastContextType {
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastType[]>([])

  React.useEffect(() => {
    console.log('[Toast] Provider MOUNTED')
    return () => console.log('[Toast] Provider UNMOUNTED')
  }, [])

  React.useEffect(() => {
    console.log('[Toast] Toasts state:', toasts.length)
  }, [toasts])

  const value: ToastContextType = React.useMemo(() => ({
    success: (message: string, duration = 4000) => {
      const id = Math.random().toString(36).substr(2, 9)
      console.log('[Toast] Adding success:', id)
      setToasts(prev => [...prev, { id, type: 'success', message, duration }])
      if (duration > 0) {
        setTimeout(() => {
          console.log('[Toast] Removing:', id)
          setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
      }
    },
    error: (message: string, duration = 4000) => {
      const id = Math.random().toString(36).substr(2, 9)
      console.log('[Toast] Adding error:', id)
      setToasts(prev => [...prev, { id, type: 'error', message, duration }])
      if (duration > 0) {
        setTimeout(() => {
          console.log('[Toast] Removing:', id)
          setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
      }
    },
    info: (message: string, duration = 4000) => {
      const id = Math.random().toString(36).substr(2, 9)
      setToasts(prev => [...prev, { id, type: 'info', message, duration }])
      if (duration > 0) {
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
      }
    },
    warning: (message: string, duration = 4000) => {
      const id = Math.random().toString(36).substr(2, 9)
      setToasts(prev => [...prev, { id, type: 'warning', message, duration }])
      if (duration > 0) {
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
      }
    },
  }), [])

  const getIcon = (type: ToastType['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />
      case 'error': return <XCircle className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      case 'info': return <Info className="w-5 h-5" />
    }
  }

  const getColors = (type: ToastType['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white'
      case 'error': return 'bg-red-500 text-white'
      case 'warning': return 'bg-yellow-500 text-white'
      case 'info': return 'bg-blue-500 text-white'
    }
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none w-full max-w-md">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              ${getColors(toast.type)} 
              px-6 py-3 rounded-lg shadow-2xl mb-2 
              flex items-center gap-3 min-w-[320px]
              pointer-events-auto
              animate-slide-down
            `}
          >
            {getIcon(toast.type)}
            <p className="flex-1 font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

