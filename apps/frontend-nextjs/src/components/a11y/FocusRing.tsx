/**
 * FocusRing Component
 * Accessible focus ring for interactive elements
 * Per TZ: 2px solid accent or high contrast
 */

'use client'

import { ReactNode } from 'react'

interface FocusRingProps {
  children: ReactNode
  className?: string
  focusColor?: 'accent' | 'white' | 'black'
  offset?: number
}

export function FocusRing({
  children,
  className = '',
  focusColor = 'accent',
  offset = 2,
}: FocusRingProps) {
  const colors = {
    accent: 'focus-visible:ring-[var(--color-accent)]',
    white: 'focus-visible:ring-white',
    black: 'focus-visible:ring-black',
  }

  return (
    <div
      className={`
        ${className}
        focus-visible:outline-none
        focus-visible:ring-2
        ${colors[focusColor]}
        focus-visible:ring-offset-${offset}
        focus-visible:ring-offset-transparent
        rounded-inherit
      `}
      tabIndex={0}
    >
      {children}
    </div>
  )
}

/**
 * Skip to main content link (A11y requirement)
 */
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="
        sr-only
        focus:not-sr-only
        focus:absolute
        focus:top-4
        focus:left-4
        focus:z-50
        focus:px-4
        focus:py-2
        focus:bg-[var(--color-accent)]
        focus:text-white
        focus:rounded-lg
        focus:shadow-lg
      "
      aria-label="Перейти к основному контенту"
    >
      Перейти к содержимому
    </a>
  )
}

/**
 * ARIA live region for announcements
 */
export function LiveRegion({ 
  message, 
  politeness = 'polite' as 'polite' | 'assertive' 
}: { 
  message: string; 
  politeness?: 'polite' | 'assertive' 
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

