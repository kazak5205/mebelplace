'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Log error to monitoring service
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      // Send to error monitoring service
      fetch('/api/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(console.error)
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">😵</div>
            <h1 className="text-2xl font-bold mb-4">Что-то пошло не так</h1>
            <p className="text-gray-400 mb-6">
              Произошла неожиданная ошибка. Мы уже работаем над её исправлением.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#FF6600] hover:bg-[#E55A00] text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Перезагрузить страницу
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                На главную
              </button>
            </div>
            
            {/* Error details hidden in production for security */}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    if (typeof window !== 'undefined') {
      fetch('/api/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(console.error)
    }
  }
}
