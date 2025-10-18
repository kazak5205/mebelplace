import { useRef, useCallback } from 'react'

export interface DoubleTapOptions {
  onLike: () => void
  onSingleTap?: () => void
  delay?: number
  enableHaptic?: boolean
}

export function useDoubleTapLike({
  onLike,
  onSingleTap,
  delay = 300,
  enableHaptic = true,
}: DoubleTapOptions) {
  const tapCount = useRef(0)
  const tapTimer = useRef<NodeJS.Timeout>()
  const lastTapPos = useRef<{ x: number; y: number } | null>(null)

  const triggerHaptic = useCallback(() => {
    if (!enableHaptic) return
    
    // Trigger haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // Short vibration
    }

    // iOS Taptic Engine (if available)
    if ('ontouchstart' in window) {
      try {
        // @ts-ignore - Haptic API is not standard yet
        if (window.TapticEngine) {
          // @ts-ignore
          window.TapticEngine.impact({
            style: 'medium',
          })
        }
      } catch (e) {
        // Haptic not available
      }
    }
  }, [enableHaptic])

  const handleTap = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      const pos = {
        x: 'touches' in event ? event.touches[0].clientX : event.clientX,
        y: 'touches' in event ? event.touches[0].clientY : event.clientY,
      }

      tapCount.current++

      if (tapCount.current === 1) {
        // First tap - start timer
        lastTapPos.current = pos
        
        tapTimer.current = setTimeout(() => {
          // Single tap
          tapCount.current = 0
          lastTapPos.current = null
          onSingleTap?.()
        }, delay)
      } else if (tapCount.current === 2) {
        // Double tap detected
        clearTimeout(tapTimer.current)
        tapCount.current = 0
        
        // Trigger haptic
        triggerHaptic()
        
        // Trigger like
        onLike()
        
        // Return position for animation
        return pos
      }

      return pos
    },
    [onLike, onSingleTap, delay, triggerHaptic]
  )

  const reset = useCallback(() => {
    tapCount.current = 0
    clearTimeout(tapTimer.current)
    lastTapPos.current = null
  }, [])

  return {
    handleTap,
    reset,
    lastTapPos: lastTapPos.current,
  }
}



