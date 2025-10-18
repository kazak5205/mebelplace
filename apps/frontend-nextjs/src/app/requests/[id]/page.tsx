/**
 * Request Deep Link Page
 * Handles direct request links from push notifications
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RequestDeepLinkPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  useEffect(() => {
    // Redirect to requests page with specific request open
    router.push(`/requests?id=${requestId}`)
  }, [requestId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white">Загрузка заявки...</p>
      </div>
    </div>
  )
}

