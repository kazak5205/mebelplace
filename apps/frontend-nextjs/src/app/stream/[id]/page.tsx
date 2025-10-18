/**
 * Stream Deep Link Page
 * Handles direct stream links from push notifications
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function StreamDeepLinkPage() {
  const params = useParams()
  const router = useRouter()
  const streamId = params.id as string

  useEffect(() => {
    // Redirect to streams page with specific stream
    router.push(`/streams?id=${streamId}`)
  }, [streamId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white">Подключение к трансляции...</p>
      </div>
    </div>
  )
}

