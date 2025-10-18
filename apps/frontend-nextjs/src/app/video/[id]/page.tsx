/**
 * Video Deep Link Page
 * Handles direct video links from push notifications
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function VideoDeepLinkPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params.id as string

  useEffect(() => {
    // Redirect to feed with video open
    // Or fetch and display video directly
    router.push(`/feed?video=${videoId}`)
  }, [videoId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white">Загрузка видео...</p>
      </div>
    </div>
  )
}

