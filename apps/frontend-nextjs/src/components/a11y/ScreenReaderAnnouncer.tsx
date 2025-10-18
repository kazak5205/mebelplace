'use client'

import { useEffect, useRef } from 'react'

interface ScreenReaderAnnouncerProps {
  message: string
  priority?: 'polite' | 'assertive'
  clearAfter?: number // ms
}

export default function ScreenReaderAnnouncer({
  message,
  priority = 'polite',
  clearAfter = 3000,
}: ScreenReaderAnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!message) return

    // Clear after specified time
    const timer = setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = ''
      }
    }, clearAfter)

    return () => clearTimeout(timer)
  }, [message, clearAfter])

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Hook for programmatic announcements
export function useAnnounce() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById('global-announcer')
    if (announcer) {
      announcer.setAttribute('aria-live', priority)
      announcer.textContent = message

      // Clear after 3s
      setTimeout(() => {
        announcer.textContent = ''
      }, 3000)
    }
  }

  return { announce }
}


