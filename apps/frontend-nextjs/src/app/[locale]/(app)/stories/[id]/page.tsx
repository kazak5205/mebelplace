'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function StoryViewPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.id as string
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    // Mark as viewed
    const markViewed = async () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token')
      if (!token) return

      await fetch(`/api/v2/stories/${storyId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    }
    markViewed()
  }, [storyId])

  const handleLike = async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token')
    if (!token) {
      alert('Войдите чтобы лайкнуть')
      return
    }

    try {
      const response = await fetch(`/api/v2/stories/${storyId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setLiked(true)
      }
    } catch (error) {
      console.error('Failed to like story:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 right-4 text-white text-2xl z-10"
      >
        ✕
      </button>

      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`absolute bottom-24 right-4 text-4xl z-10 transition-transform ${liked ? 'scale-125' : ''}`}
      >
        {liked ? '❤️' : '🤍'}
      </button>

      {/* Story Content - will be loaded dynamically */}
      <div className="text-white text-center">
        <p className="text-lg">Просмотр стори #{storyId}</p>
        <p className="text-sm text-gray-400 mt-2">(Полный viewer будет реализован)</p>
      </div>
    </div>
  )
}

