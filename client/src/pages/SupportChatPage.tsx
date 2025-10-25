import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, MessageCircle, Headphones, Clock, CheckCircle } from 'lucide-react'
import { Chat, Message } from '../types'
import { chatService } from '../services/chatService'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'

const SupportChatPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { socket, on, off } = useSocket()

  useEffect(() => {
    loadSupportChat()
    setupSocketListeners()
    
    return () => {
      cleanupSocketListeners()
    }
  }, [])

  const setupSocketListeners = () => {
    if (!socket) return

    const handleNewMessage = (data: any) => {
      console.log('[SupportChat] Received new_message event:', data)
      if (data.chatId === chat?.id || data.chat_id === chat?.id) {
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === data.message.id)
          if (exists) return prev
          return [...prev, data.message]
        })
        scrollToBottom()
      }
    }

    const handleUserStatusChange = (data: any) => {
      console.log('[SupportChat] User status changed:', data)
      setChat((prevChat) => {
        if (!prevChat) return prevChat
        return {
          ...prevChat,
          participants: prevChat.participants?.map((p: any) => {
            const participantId = p.user_id || p.userId || p.id
            if (participantId === data.userId) {
              return { ...p, is_active: data.isActive }
            }
            return p
          })
        }
      })
    }

    on('new_message', handleNewMessage)
    on('user_status_changed' as any, handleUserStatusChange)

    return () => {
      off('new_message', handleNewMessage)
      off('user_status_changed' as any, handleUserStatusChange)
    }
  }

  const cleanupSocketListeners = () => {
    off('new_message', () => {})
    off('user_status_changed' as any, () => {})
  }

  const loadSupportChat = async () => {
    try {
      setLoading(true)
      
      // Создаем или получаем чат поддержки
      const response = await chatService.createSupportChat()
      setChat(response)
      
      // Загружаем сообщения
      const messagesResponse = await chatService.getMessages(response.id)
      setMessages(messagesResponse.messages || [])
      
    } catch (error) {
      console.error('Failed to load support chat:', error)
      setError('Не удалось загрузить чат поддержки')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !chat || sending) return

    try {
      setSending(true)
      setError(null)
      
      const message = await chatService.sendMessage(chat.id, newMessage.trim())
      setMessages(prev => [...prev, message])
      setNewMessage('')
      scrollToBottom()
    } catch (err: any) {
      console.error('Failed to send message:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Не удалось отправить сообщение'
      setError(errorMsg)
      setTimeout(() => setError(null), 5000)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getOtherParticipant = () => {
    if (!chat?.participants || chat.participants.length === 0) {
      return null
    }
    
    // Ищем участника поддержки (админа)
    const supportParticipant = chat.participants.find((p: any) => {
      const participantId = p.user_id || p.userId || p.id
      const currentUserId = user?.id
      return participantId !== currentUserId
    })
    
    return supportParticipant || null
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

  if (!chat) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-white/70 mb-2">
          Чат поддержки недоступен
        </h3>
        <button
          onClick={() => navigate('/user/messenger')}
          className="glass-button"
        >
          Вернуться к мессенджеру
        </button>
      </div>
    )
  }

  const supportParticipant = getOtherParticipant()

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col pb-20">
      {/* Support Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-4"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/user/messenger')}
            className="glass-button p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-white flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Поддержка MebelPlace
              </h3>
              <p className="text-sm text-white/60">
                {supportParticipant?.isActive ? 'В сети' : 'Не в сети'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-white/60">
            <Clock className="w-4 h-4" />
            <span>Обычно отвечаем в течение 5 минут</span>
          </div>
        </div>
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-4"
      >
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-white mb-1">Добро пожаловать в поддержку!</h4>
            <p className="text-sm text-white/70">
              Мы поможем вам с любыми вопросами по использованию платформы MebelPlace. 
              Опишите вашу проблему, и мы постараемся решить её как можно быстрее.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 glass-card p-4 overflow-y-auto scrollbar-hide"
      >
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${
                      message.senderId === user?.id 
                        ? 'text-blue-100' 
                        : 'text-white/60'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                    {message.senderId === user?.id && (
                      <CheckCircle className="w-3 h-3 text-blue-200" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-3 mt-4 bg-red-500/20 border border-red-500/50"
          >
            <p className="text-red-400 text-sm text-center">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSendMessage}
        className="glass-card p-4 mt-4"
      >
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Опишите вашу проблему..."
              className="glass-input w-full"
              disabled={sending}
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!newMessage.trim() || sending}
            className="glass-button p-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.form>
    </div>
  )
}

export default SupportChatPage
