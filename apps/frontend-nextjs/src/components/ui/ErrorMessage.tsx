/**
 * ErrorMessage Component
 * User-friendly error display with retry option
 * Per TZ: no technical jargon, clear action
 */

'use client'

import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui'
import { getUserFriendlyError, getErrorWithRetry } from '@/utils/errorMessages'

interface ErrorMessageProps {
  error: any
  onRetry?: () => void
  onGoHome?: () => void
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ErrorMessage({
  error,
  onRetry,
  onGoHome,
  className = '',
  showIcon = true,
  size = 'md',
}: ErrorMessageProps) {
  const { message, canRetry } = getErrorWithRetry(error)
  
  const sizes = {
    sm: {
      icon: 'w-8 h-8',
      title: 'text-base',
      text: 'text-sm',
      spacing: 'space-y-2',
    },
    md: {
      icon: 'w-12 h-12',
      title: 'text-lg',
      text: 'text-base',
      spacing: 'space-y-4',
    },
    lg: {
      icon: 'w-16 h-16',
      title: 'text-xl',
      text: 'text-lg',
      spacing: 'space-y-6',
    },
  }

  return (
    <div
      className={`flex flex-col items-center justify-center ${sizes[size].spacing} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {showIcon && (
        <div className="text-red-500">
          <AlertCircle className={sizes[size].icon} aria-hidden="true" />
        </div>
      )}
      
      <div className="text-center space-y-2">
        <h3 className={`font-semibold text-[var(--color-text-primary)] ${sizes[size].title}`}>
          Ошибка загрузки
        </h3>
        <p className={`text-[var(--color-text-secondary)] ${sizes[size].text} max-w-md`}>
          {message}
        </p>
      </div>

      <div className="flex gap-3">
        {canRetry && onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            icon={<RefreshCw className="w-4 h-4" />}
            aria-label="Попробовать снова"
          >
            Попробовать снова
          </Button>
        )}
        
        {onGoHome && (
          <Button
            onClick={onGoHome}
            variant="ghost"
            icon={<Home className="w-4 h-4" />}
            aria-label="Вернуться на главную"
          >
            На главную
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Inline error (for forms)
 */
export function InlineError({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-2 text-red-500 text-sm mt-1"
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

/**
 * Toast error (for notifications)
 */
export function showErrorToast(error: any) {
  const message = getUserFriendlyError(error)
  
  // Use native toast if available, fallback to custom
  if (typeof window !== 'undefined') {
    // @ts-ignore
    if (window.toast) {
      // @ts-ignore
      window.toast.error(message)
    } else {
      // Fallback: create simple toast
      const toast = document.createElement('div')
      toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up'
      toast.textContent = message
      toast.setAttribute('role', 'alert')
      toast.setAttribute('aria-live', 'assertive')
      
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transform = 'translateX(-50%) translateY(20px)'
        setTimeout(() => document.body.removeChild(toast), 300)
      }, 4000)
    }
  }
}

