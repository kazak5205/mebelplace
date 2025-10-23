import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import VideoPlayer from '../components/VideoPlayer'
import { Video } from '../types'
import { videoService } from '../services/videoService'
import { useSocket } from '../contexts/SocketContext'

const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const { } = useSocket() // Socket для real-time обновлений

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await videoService.getVideos({ 
        limit: 50
      })
      setVideos(response.videos)
    } catch (error) {
      console.error('Failed to load videos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center text-white/70">
          <p className="text-xl mb-2">Пока нет видео</p>
          <p className="text-sm">Загрузите первое видео!</p>
        </div>
      </div>
    )
  }

  // TikTok-style плеер на весь экран
  return (
    <div className="fixed inset-0 bg-black z-40">
      <VideoPlayer
        videos={videos}
        initialIndex={0}
        onClose={() => {
          // Главная страница - не даём закрыть
        }}
        onVideoChange={(video) => {
          // Можно отслеживать просмотры
          console.log('Viewing video:', video.id)
        }}
      />
    </div>
  )
}

export default HomePage
