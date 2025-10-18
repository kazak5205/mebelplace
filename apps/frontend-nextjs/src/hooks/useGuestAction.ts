/**
 * Guest Action Hook
 * Handles guest users trying to perform authenticated actions
 * Per TZ: Show register modal, save context, restore after login
 */

'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/api/hooks/useAuth'

type GuestAction = 'like' | 'comment' | 'subscribe' | 'create_request' | 'message'

interface GuestActionContext {
  videoId?: number
  channelId?: number
  masterId?: number
}

export function useGuestAction() {
  const { user } = useAuth()
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<GuestAction>('like')
  const [pendingContext, setPendingContext] = useState<GuestActionContext>({})

  const requireAuth = useCallback((
    action: GuestAction,
    context: GuestActionContext,
    callback: () => void
  ) => {
    if (!user) {
      // Guest - show modal
      setPendingAction(action)
      setPendingContext(context)
      setShowGuestModal(true)
      return false
    }

    // Authenticated - execute
    callback()
    return true
  }, [user])

  const closeGuestModal = useCallback(() => {
    setShowGuestModal(false)
  }, [])

  return {
    requireAuth,
    showGuestModal,
    closeGuestModal,
    pendingAction,
    pendingContext,
  }
}

