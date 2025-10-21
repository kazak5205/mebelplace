import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import VideoPlayer from '../components/VideoPlayer'
import type { Video } from '@shared/types'
import { videoService } from '../services/videoService'
import { useSocket } from '../contexts/SocketContext'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null)
  const { emit, on } = useSocket()

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await videoService.getVideos({ 
        limit: 50
      }) as any
      setVideos(response.videos || [])
    } catch (error) {
      console.error('Failed to load videos:', error)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full"
        />
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-xl mb-2">Пока нет видео</p>
          <p className="text-sm text-white/60 dark:text-gray-400">Загрузите первое видео!</p>
        </div>
      </div>
    )
  }

  // Показываем fullscreen плеер только когда видео выбрано
  if (selectedVideoIndex !== null) {
    return (
      <VideoPlayer
        videos={videos}
        initialIndex={selectedVideoIndex}
        onClose={() => setSelectedVideoIndex(null)}
        onVideoChange={(video) => {
          // Логика при смене видео
        }}
      />
    )
  }

  // Лента видео (grid/list view)
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card overflow-hidden cursor-pointer group"
            onClick={() => setSelectedVideoIndex(index)}
          >
            <div className="relative aspect-[9/16] bg-black">
              <video
                src={video.videoUrl}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                  {video.title}
                </h3>
                <p className="text-white/70 text-xs">
                  @{video.username || video.firstName || 'Master'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default HomePage
