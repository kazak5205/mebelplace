import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import { Chat } from '../types'
import { chatService } from '../services/chatService'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'

const ChatListPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [_error] = useState<string | null>(null)
  const navigate = useNavigate()
  const { socket, on, off } = useSocket()
  const { user } = useAuth()

  // Helper: получить ДРУГОГО участника (не себя)
  const getOtherParticipant = (chat: Chat) => {
    if (!chat.participants || chat.participants.length === 0) {
      return null
    }
    
    // Ищем участника, который НЕ текущий пользователь
    const otherParticipant = chat.participants.find((p: any) => {
      const participantId = p.user_id || p.userId || p.id
      const currentUserId = user?.id
      return participantId !== currentUserId
    })
    
    // Если не нашли, возвращаем null (НЕ берём первого!)
    return otherParticipant || null
  }

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data: any) => {
      console.log('ChatList received new_message:', data)
      const chatId = data.chatId || data.chat_id
      
      setChats(prev => {
        const existingChatIndex = prev.findIndex(chat => chat.id === chatId)
        
        if (existingChatIndex >= 0) {
          // Обновляем существующий чат
          const updated = [...prev]
          updated[existingChatIndex] = {
            ...updated[existingChatIndex],
            lastMessage: data.message,
            unreadCount: (updated[existingChatIndex].unreadCount || 0) + 1,
            updatedAt: data.message.createdAt || data.message.created_at
          }
          // Сортируем - новый чат наверх
          return updated.sort((a, b) => 
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
          )
        } else {
          // Новый чат - перезагружаем список
          loadChats()
          return prev
        }
      })
    }

    const handleUserStatusChange = (data: any) => {
      console.log('ChatList user status changed:', data)
      // Обновляем статус участников во всех чатах
      setChats(prev => prev.map(chat => ({
        ...chat,
        participants: chat.participants?.map((p: any) => {
          const participantId = p.user_id || p.userId || p.id
          if (participantId === data.userId) {
            return { ...p, is_active: data.isActive }
          }
          return p
        })
      })))
    }

    on('new_message', handleNewMessage)
    on('user_status_changed' as any, handleUserStatusChange)

    return () => {
      off('new_message', handleNewMessage)
      off('user_status_changed' as any, handleUserStatusChange)
    }
  }, [socket, on, off])

  const loadChats = async () => {
    try {
      setLoading(true)
      const response = await chatService.getChats()
      setChats(response.chats || [])
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChats = chats.filter(chat => 
    chat.participants?.some(participant => 
      (participant.name || participant.username || participant.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) || false
  )

  const formatLastMessage = (message: any) => {
    if (!message) return 'Нет сообщений'
    
    // Если message это строка (lastMessage может быть строкой из БД)
    const content = typeof message === 'string' ? message : message.content
    
    if (!content) return 'Нет сообщений'
    
    const maxLength = 50
    if (content.length > maxLength) {
      return content.substring(0, maxLength) + '...'
    }
    return content
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
        className="flex items-center justify-center"
      >
        <h1 className="text-3xl font-bold gradient-text text-center">Чаты</h1>
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
                        const participant: any = getOtherParticipant(chat)
                        if (participant?.role === 'master') {
                          navigate(`/profile/${participant.user_id}`)
                        }
                      }}
                      className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
                      aria-label="Канал мастера"
                    >
                      {(() => {
                        const participant = getOtherParticipant(chat) as any;
                        if (participant?.avatar) {
                          return (
                            <img
                              src={participant.avatar.startsWith('http') ? participant.avatar : `https://mebelplace.com.kz${participant.avatar}`}
                              alt={participant?.name || participant?.username || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('Chat list avatar image failed to load:', e.currentTarget.src);
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          );
                        }
                        return (
                          <span style={{ display: participant?.avatar ? 'none' : 'flex' }}>
                            {(participant?.name || participant?.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        );
                      })()}
                    </button>
                    {(getOtherParticipant(chat) as any)?.is_active && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-white truncate">
                        {(getOtherParticipant(chat) as any)?.name || (getOtherParticipant(chat) as any)?.username}
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
