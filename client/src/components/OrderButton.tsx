import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Video } from '../types'
import { chatService } from '../services/chatService'

interface OrderButtonProps {
  video: Video
  className?: string
}

const OrderButton: React.FC<OrderButtonProps> = ({ video, className = '' }) => {
  const navigate = useNavigate()
  const { user, isClient } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Показываем кнопку только для клиентов и не для собственных видео
  const videoAuthorId = video.author_id || video.authorId || video.masterId || video.master?.id
  if (!isClient || !user || videoAuthorId === user.id) {
    return null
  }

  const handleOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      // Используем author_id (возвращается с бэка) или authorId или masterId или master.id
      const masterId = video.author_id || video.authorId || video.masterId || video.master?.id
      if (!masterId) {
        setError('ID мастера не найден')
        setTimeout(() => setError(null), 5000)
        return
      }
      const chat = await chatService.createChatWithUser(masterId) as any
      
      const autoMessage = `Здравствуйте! Интересует мебель из видео: ${video.title}`
      
      // Отправляем сообщение с превью видео
      await chatService.sendMessage(chat.id || chat.chatId, autoMessage, 'video', undefined, {
        videoId: video.id,
        videoTitle: video.title,
        videoThumbnail: video.thumbnailUrl || (video as any).thumbnail_url || '',
        videoUrl: video.videoUrl || (video as any).video_url || '',
        masterName: video.username || 'Мастер'
      })
      
      navigate(`/chat/${chat.id || chat.chatId}`)
    } catch (error: any) {
      console.error('Failed to create order chat:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Не удалось создать чат. Попробуйте позже.'
      setError(errorMessage)
      // Автоматически скрываем ошибку через 5 секунд
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation()
          handleOrder()
        }}
        disabled={loading}
        className={`
          relative overflow-hidden
          px-6 py-4 sm:px-8 sm:py-5
          bg-gradient-to-r from-orange-500 to-orange-600
          text-white font-bold text-base sm:text-lg
          rounded-2xl shadow-lg hover:shadow-xl
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center space-x-3
          ${className}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            <span>Создание чата...</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>ЗАКАЗАТЬ ЭТУ МЕБЕЛЬ</span>
          </>
        )}
      </motion.button>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50"
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}

export default OrderButton

