'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface Video {
  id: number
  title: string
  description: string
  path: string
  user_id: number
  size_bytes: number
  created_at: string
}

export default function AdminVideos() {
  const t = useTranslations('admin.videos')
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/v2/admin/videos', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setVideos(data.data || data.videos || [])
      } else {
        setError(t('loadError'))
      }
    } catch (error) {
      setError(t('networkError'))
    } finally {
      setLoading(false)
    }
  }

  const deleteVideo = async (videoId: number) => {
    if (!confirm(t('deleteConfirm'))) {
      return
    }

    try {
      const response = await fetch(`/api/v2/admin/videos/${videoId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setVideos(videos.filter(video => video.id !== videoId))
        alert(t('deleteSuccess'))
      } else {
        alert(t('deleteError'))
      }
    } catch (error) {
      alert(t('networkError'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <button
          onClick={fetchVideos}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('refresh')}
        </button>
      </div>

      {videos.length > 0 ? (
        <div className="grid gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                  <p className="text-gray-600 mt-1">{video.description}</p>
                </div>
                <button
                  onClick={() => deleteVideo(video.id)}
                  className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  {t('delete')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">{t('userId')}</p>
                  <p className="font-medium">{video.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('createdAt')}</p>
                  <p className="font-medium">{new Date(video.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <p className="text-sm text-gray-500">
                  {t('filePath')}: {video.path}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('noVideos')}</p>
        </div>
      )}
    </div>
  )
}