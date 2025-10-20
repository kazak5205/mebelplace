import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import { Chat } from '../types'
import { chatService } from '../services/chatService'
import { useSocket } from '../contexts/SocketContext'

const ChatListPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { on } = useSocket()

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    // Listen for new messages
    on('new_message', (data) => {
      setChats(prev => prev.map(chat => 
        chat.id === data.chatId 
          ? { 
              ...chat, 
              lastMessage: data.message,
              unreadCount: chat.unreadCount + 1,
              updatedAt: data.message.createdAt
            }
          : chat
      ))
    })
  }, [on])

  const loadChats = async () => {
    try {
      setLoading(true)
      const response = await chatService.getChats()
      setChats(response)
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChats = chats.filter(chat => 
    chat.participants.some(participant => 
      participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const formatLastMessage = (message: any) => {
    if (!message) return 'Нет сообщений'
    
    const maxLength = 50
    if (message.content.length > maxLength) {
      return message.content.substring(0, maxLength) + '...'
    }
    return message.content
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'только что'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}м`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}ч`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold gradient-text">Чаты</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-button flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Новый чат</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
        <input
          type="text"
          placeholder="Поиск чатов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input w-full pl-12"
        />
      </motion.div>

      <div className="space-y-4">
        {filteredChats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white/70 mb-2">
              {searchQuery ? 'Чаты не найдены' : 'Нет чатов'}
            </h3>
            <p className="text-white/50">
              {searchQuery 
                ? 'Попробуйте изменить поисковый запрос'
                : 'Начните новый чат с мастером'
              }
            </p>
          </motion.div>
        ) : (
          filteredChats.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard
                variant="hover"
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-4 p-4">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const participant = chat.participants[0]
                        if (participant?.role === 'master') {
                          navigate(`/master/${participant.id}`)
                        }
                      }}
                      className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold"
                      aria-label="Канал мастера"
                    >
                      {chat.participants[0]?.name.charAt(0).toUpperCase()}
                    </button>
                    {chat.participants[0]?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-white truncate">
                        {chat.participants[0]?.name}
                      </h3>
                      <span className="text-xs text-white/60">
                        {formatTime(chat.updatedAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-white/70 truncate">
                      {formatLastMessage(chat.lastMessage)}
                    </p>
                  </div>

                  {chat.unreadCount > 0 && (
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default ChatListPage
