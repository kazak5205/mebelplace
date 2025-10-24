import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import VideoPlayer from '../components/VideoPlayer'
import Header from '../components/Header'
import BottomNavigation from '../components/BottomNavigation'
import { Video } from '../types'
import { videoService } from '../services/videoService'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'

const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [initialIndex, setInitialIndex] = useState(0)
  const { user } = useAuth()
  const { } = useSocket() // Socket для real-time обновлений

  useEffect(() => {
    loadVideos()
  }, [searchParams])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const videoId = searchParams.get('videoId')
      
      // Если есть videoId, сначала загружаем это видео и видео автора
      if (videoId) {
        try {
          const video = await videoService.getVideo(videoId)
          const authorId = video.authorId || video.author_id
          
          if (authorId) {
            // Загружаем все видео автора
            const response = await videoService.getVideos({ 
              author_id: authorId,
              limit: 50 
            })
            setVideos(response.videos)
            
            // Находим индекс нужного видео
            const index = response.videos.findIndex((v: Video) => v.id === videoId)
            setInitialIndex(index !== -1 ? index : 0)
            return
          }
        } catch (error) {
          console.error('Failed to load specific video:', error)
          // Если не удалось загрузить конкретное видео, загружаем обычный фид
        }
      }
      
      // Обычная загрузка фида
      const params = user?.role === 'master' 
        ? { limit: 50, exclude_author: user.id }
        : { limit: 50, recommendations: true }
      
      const response = await videoService.getVideos(params)
      setVideos(response.videos)
      setInitialIndex(0)
    } catch (error) {
      console.error('Failed to load videos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
          />
        </div>
        <BottomNavigation />
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center pb-20">
          <div className="text-center text-white/70">
            <p className="text-xl mb-2">Пока нет видео</p>
            <p className="text-sm">Загрузите первое видео!</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  // TikTok-style плеер на весь экран  
  return (
    <VideoPlayer
      videos={videos}
      initialIndex={initialIndex}
      onVideoChange={(video) => {
        // Можно отслеживать просмотры
        console.log('Viewing video:', video.id)
      }}
    />
  )
}

export default HomePage
