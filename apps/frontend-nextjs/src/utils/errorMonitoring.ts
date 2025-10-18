'use client'

// Error monitoring and logging utility
interface ErrorInfo {
  error: Error
  errorInfo?: any
  userId?: string
  context?: string
  timestamp?: number
  userAgent?: string
  url?: string
}

interface PerformanceInfo {
  metric: string
  value: number
  context?: string
  timestamp?: number
}

class ErrorMonitoring {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private apiEndpoint = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  private errors: ErrorInfo[] = []
  private maxErrors = 100

  // Log error to console and send to backend
  logError(errorInfo: ErrorInfo) {
    const enrichedError = {
      ...errorInfo,
      timestamp: errorInfo.timestamp || Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    }

    // Store locally
    this.errors.push(enrichedError)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Log to console in development
    if (this.isDevelopment) {
      console.error('🚨 Error logged:', enrichedError)
    }

    // Send to backend (non-blocking)
    this.sendErrorToBackend(enrichedError).catch(err => {
      if (this.isDevelopment) {
        console.warn('Failed to send error to backend:', err)
      }
    })
  }

  // Log performance metrics
  logPerformance(perfInfo: PerformanceInfo) {
    const enrichedPerf = {
      ...perfInfo,
      timestamp: perfInfo.timestamp || Date.now()
    }

    if (this.isDevelopment) {
      console.log('📊 Performance metric:', enrichedPerf)
    }

    // Send to backend (non-blocking)
    this.sendPerformanceToBackend(enrichedPerf).catch(err => {
      if (this.isDevelopment) {
        console.warn('Failed to send performance data to backend:', err)
      }
    })
  }

  // Send error to backend
  private async sendErrorToBackend(errorInfo: ErrorInfo) {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: errorInfo.error.message,
          stack: errorInfo.error.stack,
          name: errorInfo.error.name,
          context: errorInfo.context,
          userId: errorInfo.userId,
          userAgent: errorInfo.userAgent,
          url: errorInfo.url,
          timestamp: errorInfo.timestamp,
          errorInfo: errorInfo.errorInfo
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      // Silent fail - don't create infinite error loops
    }
  }

  // Send performance data to backend
  private async sendPerformanceToBackend(perfInfo: PerformanceInfo) {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(perfInfo)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      // Silent fail
    }
  }

  // Get all errors
  getErrors() {
    return [...this.errors]
  }

  // Get recent errors (for debugging)
  getRecentErrors(limit = 10) {
    return this.errors.slice(-limit)
  }

  // Clear stored errors
  clearErrors() {
    this.errors = []
  }

  // Set user context
  setUser(userId: string) {
    this.userId = userId
  }

  // Set user ID
  setUserId(userId: string) {
    this.userId = userId
  }

  // Clear user ID
  clearUserId() {
    this.userId = undefined
  }

  private userId?: string
}

// Global error monitoring instance
export const errorMonitor = new ErrorMonitoring()

// React Error Boundary helper
export function logReactError(error: Error, errorInfo: any, context = 'React') {
  errorMonitor.logError({
    error,
    errorInfo,
    context,
    userId: errorMonitor['userId']
  })
}

// Promise rejection handler
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorMonitor.logError({
      error: new Error(event.reason || 'Unhandled Promise Rejection'),
      context: 'UnhandledPromiseRejection'
    })
  })

  // Global JavaScript errors
  window.addEventListener('error', (event) => {
    errorMonitor.logError({
      error: new Error(event.message || 'Global JavaScript Error'),
      context: 'GlobalError'
    })
  })

  // Resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const target = event.target as HTMLElement
      errorMonitor.logError({
        error: new Error(`Resource loading failed: ${target.tagName}`),
        context: 'ResourceLoadError'
      })
    }
  }, true)
}

// Performance monitoring helpers
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  context?: string
): Promise<T> {
  const start = performance.now()
  
  const finish = (result: T) => {
    const duration = performance.now() - start
    errorMonitor.logPerformance({
      metric: name,
      value: duration,
      context
    })
    return result
  }

  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result.then(finish).catch(error => {
        errorMonitor.logError({
          error: error instanceof Error ? error : new Error(String(error)),
          context: `${name}_Promise`
        })
        throw error
      })
    }
    
    return Promise.resolve(finish(result))
  } catch (error) {
    errorMonitor.logError({
      error: error instanceof Error ? error : new Error(String(error)),
      context: name
    })
    throw error
  }
}

// Video-specific error logging
export function logVideoError(
  error: string | Error,
  videoSrc?: string,
  context = 'Video'
) {
  errorMonitor.logError({
    error: error instanceof Error ? error : new Error(error),
    context: `${context}${videoSrc ? `_${videoSrc}` : ''}`
  })
}

// API error logging
export function logApiError(
  error: Error,
  endpoint: string,
  method = 'GET',
  status?: number
) {
  errorMonitor.logError({
    error,
    context: `API_${method}_${endpoint}${status ? `_${status}` : ''}`
  })
}

// User action tracking (for debugging user flows)
export function trackUserAction(
  action: string,
  context?: string,
  metadata?: Record<string, any>
) {
  if (process.env.NODE_ENV === 'development') {
    console.log('👤 User action:', { action, context, metadata })
  }
  
  // Could send to analytics service here
  errorMonitor.logPerformance({
    metric: `user_action_${action}`,
    value: 1,
    context: context || 'UserAction'
  })
}

