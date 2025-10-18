'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Send error to monitoring service
    if (typeof window !== 'undefined') {
      // In production, send to error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Example: Sentry, LogRocket, etc.
        console.error('Production error:', error, errorInfo)
      }
    }
    
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* Error Message */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Что-то пошло не так
              </h1>
              <p className="text-gray-400">
                Произошла неожиданная ошибка. Мы уже работаем над её исправлением.
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-800 rounded-lg p-4 text-left">
                <h3 className="text-sm font-semibold text-red-400 mb-2">
                  Детали ошибки (только в разработке):
                </h3>
                <pre className="text-xs text-gray-300 overflow-auto">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full btn-primary"
              >
                Перезагрузить страницу
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full btn-secondary"
              >
                Вернуться назад
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                На главную
              </button>
            </div>

            {/* Support Info */}
            <div className="text-xs text-gray-500">
              <p>Если проблема повторяется, обратитесь в поддержку:</p>
              <p className="text-[#FF6600] mt-1">support@mebelplace.kz</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC для обертывания компонентов
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Специализированные Error Boundaries для разных частей приложения
export function VideoErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="video-container flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎥</div>
            <h3 className="text-xl font-bold">Ошибка воспроизведения</h3>
            <p className="text-gray-400">Не удалось загрузить видео</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      }
      onError={(error) => {
        console.error('Video error:', error)
        // Track video-specific errors
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ChatErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="text-4xl">💬</div>
            <h3 className="text-lg font-bold">Ошибка чата</h3>
            <p className="text-gray-400 text-sm">Не удалось загрузить сообщения</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-sm py-2 px-4"
            >
              Обновить
            </button>
          </div>
        </div>
      }
      onError={(error) => {
        console.error('Chat error:', error)
        // Track chat-specific errors
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function SearchErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-bold">Ошибка поиска</h3>
            <p className="text-gray-400 text-sm">Не удалось выполнить поиск</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-sm py-2 px-4"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      }
      onError={(error) => {
        console.error('Search error:', error)
        // Track search-specific errors
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
