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

  // Показываем кнопку только для клиентов и не для собственных видео
  if (!isClient || !user || video.masterId === user.id) {
    return null
  }

  const handleOrder = async () => {
    try {
      setLoading(true)
      const chat = await chatService.createChatWithUser(video.masterId) as any
      
      const autoMessage = `${video.title}`
      const metadata = {
        videoId: video.id,
        videoTitle: video.title,
        videoThumbnail: video.thumbnailUrl ? `https://mebelplace.com.kz${video.thumbnailUrl}` : null
      }
      
      console.log('🔍 [OrderButton] Sending message with metadata:', metadata)
      await chatService.sendMessage(chat.id || chat.chatId, autoMessage, 'text', metadata)
      
      navigate(`/chat/${chat.id || chat.chatId}`)
    } catch (error) {
      console.error('Failed to create order chat:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
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
        bg-gradient-to-r from-orange-500 to-pink-500
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
  )
}

export default OrderButton

