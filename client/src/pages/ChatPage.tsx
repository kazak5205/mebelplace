import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, Image, MoreVertical, Ban, Trash2 } from 'lucide-react'
import { Chat, Message } from '../types'
import { chatService } from '../services/chatService'
import { userService } from '../services/userService'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { socket, on, off, emit } = useSocket()

  // Helper: получить ДРУГОГО участника (не себя)
  const getOtherParticipant = () => {
    if (!chat?.participants || chat.participants.length === 0) {
      return null
    }
    
    // Ищем участника, который НЕ текущий пользователь
    const otherParticipant = chat.participants.find((p: any) => {
      const participantId = p.user_id || p.userId || p.id
      const currentUserId = user?.id
      console.log('[ChatPage] Comparing:', participantId, '!==', currentUserId, '=', participantId !== currentUserId)
      return participantId !== currentUserId
    })
    
    console.log('[ChatPage] Other participant:', otherParticipant?.name || otherParticipant?.username || 'NOT FOUND')
    // Если не нашли, возвращаем null (НЕ берём первого!)
    return otherParticipant || null
  }

  useEffect(() => {
    if (id) {
      loadChat()
      loadMessages()
    }
  }, [id])

  useEffect(() => {
    if (!socket || !id) return

    console.log(`[ChatPage] Setting up WebSocket listener for chat ${id}`)

    // ✅ Присоединяемся к комнате чата (КРИТИЧНО для real-time!)
    emit('join_chat', { chatId: id })
    console.log('[ChatPage] Sent join_chat event for chatId:', id)

    const handleNewMessage = (data: any) => {
      console.log('[ChatPage] Received new_message event:', data)
      console.log('[ChatPage] Current chat ID:', id)
      console.log('[ChatPage] Event chatId:', data.chatId || data.chat_id)
      
      if (data.chatId === id || data.chat_id === id) {
        console.log('[ChatPage] Message is for this chat, adding to state')
        setMessages(prev => {
          // Проверяем, нет ли уже этого сообщения
          const exists = prev.some(msg => msg.id === data.message.id)
          if (exists) {
            console.log('[ChatPage] Message already exists, skipping')
            return prev
          }
          console.log('[ChatPage] Adding new message to state')
          return [...prev, data.message]
        })
        scrollToBottom()
      } else {
        console.log('[ChatPage] Message is for different chat, ignoring')
      }
    }

    const handleUserStatusChange = (data: any) => {
      console.log('[ChatPage] User status changed:', data)
      // Обновляем статус участника чата
      setChat((prevChat) => {
        if (!prevChat) return prevChat
        return {
          ...prevChat,
          participants: prevChat.participants.map((p: any) => {
            const participantId = p.user_id || p.userId || p.id
            if (participantId === data.userId) {
              return { ...p, is_online: data.isOnline }
            }
            return p
          })
        }
      })
    }

    // Подписываемся на события
    on('new_message', handleNewMessage)
    on('user_status_changed' as any, handleUserStatusChange)
    console.log('[ChatPage] Subscribed to new_message and user_status_changed events')

    // Тест подписки - логируем все события
    if (socket.onAny) {
      socket.onAny((event: string, ...args: any[]) => {
        console.log(`[ChatPage] Socket event received: ${event}`, args)
      })
    }

    // Отписываемся при размонтировании
    return () => {
      console.log('[ChatPage] Unsubscribing from events and leaving chat room')
      off('new_message', handleNewMessage)
      off('user_status_changed' as any, handleUserStatusChange)
    }
  }, [socket, id, on, off, emit])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChat = async () => {
    try {
      const response = await chatService.getChat(id!)
      setChat(response)
    } catch (error) {
      console.error('Failed to load chat:', error)
    }
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      const response = await chatService.getMessages(id!)
      setMessages(response.messages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !id) return

    try {
      setError(null)
      // ✅ Отправляем через Socket.IO для real-time
      emit('send_message', {
        chatId: id,
        content: newMessage.trim(),
        type: 'text'
      })
      console.log('[ChatPage] Sent send_message via Socket.IO')
      
      // Также отправляем через HTTP API для сохранения в БД (fallback)
      const message = await chatService.sendMessage(id, newMessage.trim())
      console.log('[ChatPage] Message saved to DB:', message)
      
      setNewMessage('')
    } catch (err: any) {
      console.error('Failed to send message:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Не удалось отправить сообщение'
      setError(errorMsg)
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!id) return

    try {
      setUploading(true)
      setError(null)
      console.log('[UPLOAD] Starting file upload:', file.name, file.type)
      const message = await chatService.sendMessageWithFile(id, file, newMessage)
      console.log('[UPLOAD] Received message from backend:', JSON.stringify(message, null, 2))
      console.log('[UPLOAD] Message type:', message.type, 'file_path:', message.file_path)
      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (err: any) {
      console.error('Failed to send file:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Не удалось загрузить файл'
      setError(errorMsg)
      setTimeout(() => setError(null), 5000)
    } finally {
      setUploading(false)
    }
  }

  const handleImageButtonClick = () => {
    const input = document.getElementById('image-upload') as HTMLInputElement
    if (input) {
      input.click()
    }
  }

  const handleBlockUser = async () => {
    const otherParticipant: any = getOtherParticipant()
    const participantId = otherParticipant?.user_id || otherParticipant?.userId || otherParticipant?.id
    if (!participantId) return

    if (confirm(`Заблокировать пользователя ${otherParticipant?.name || otherParticipant?.username}?`)) {
      try {
        await userService.blockUser(participantId)
        setShowMenu(false)
        alert('Пользователь заблокирован')
        navigate('/chat')
      } catch (err: any) {
        console.error('Failed to block user:', err)
        const errorMsg = err.response?.data?.message || err.message || 'Не удалось заблокировать пользователя'
        setError(errorMsg)
        setTimeout(() => setError(null), 5000)
      }
    }
  }

  const handleDeleteChat = async () => {
    if (!id) return

    if (confirm('Удалить чат? Это действие нельзя отменить.')) {
      try {
        await chatService.deleteChat(id)
        setShowMenu(false)
        navigate('/chat')
      } catch (err: any) {
        console.error('Failed to delete chat:', err)
        const errorMsg = err.response?.data?.message || err.message || 'Не удалось удалить чат'
        setError(errorMsg)
        setTimeout(() => setError(null), 5000)
      }
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
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
          Чат не найден
        </h3>
        <button
          onClick={() => navigate('/chat')}
          className="glass-button"
        >
          Вернуться к списку чатов
        </button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col pb-20">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-4"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/chat')}
            className="glass-button p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => {
                const participant: any = getOtherParticipant()
                if (participant?.role === 'master') {
                  navigate(`/master/${participant.user_id}`)
                }
              }}
              className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
              aria-label="Канал мастера"
            >
              {(() => {
                const participant = getOtherParticipant() as any;
                if (participant?.avatar) {
                  return (
                    <img
                      src={participant.avatar.startsWith('http') ? participant.avatar : `https://mebelplace.com.kz${participant.avatar}`}
                      alt={participant?.name || participant?.username || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Chat avatar image failed to load:', e.currentTarget.src);
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
            {(getOtherParticipant() as any)?.is_online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-medium text-white">
              {(getOtherParticipant() as any)?.name || (getOtherParticipant() as any)?.username}
            </h3>
            <p className="text-sm text-white/60">
              {(getOtherParticipant() as any)?.is_online ? 'В сети' : 'Не в сети'}
            </p>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="glass-button p-2"
              aria-label="Меню"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dropdown Menu - Positioned at top level */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed top-20 right-4 w-56 glass-card p-2 z-[9999]"
            >
              <button
                onClick={handleBlockUser}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <Ban className="w-4 h-4 text-red-400" />
                <span className="text-white">Заблокировать пользователя</span>
              </button>
              
              <button
                onClick={handleDeleteChat}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="text-white">Удалить чат</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  {/* Превью видео, если есть metadata */}
                  {message.type === 'video' && message.metadata && (
                    <div className="mb-2">
                      <div 
                        className="relative bg-black rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          if (message.metadata.videoUrl) {
                            // Открываем видео в новом окне или переходим к нему
                            navigate(`/?videoId=${message.metadata.videoId}`)
                          } else if (message.metadata.videoId) {
                            // Если нет прямой ссылки, но есть ID - переходим по ID
                            navigate(`/?videoId=${message.metadata.videoId}`)
                          }
                        }}
                      >
                        <img 
                          src={message.metadata.videoThumbnail} 
                          alt={message.metadata.videoTitle}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium truncate">{message.metadata.videoTitle}</p>
                        <p className="text-sm opacity-70">от {message.metadata.masterName}</p>
                      </div>
                    </div>
                  )}

                  {/* Отображение загруженных файлов */}
                  {message.type === 'image' && message.file_path && (
                    <div className="mb-2">
                      <img 
                        src={message.file_path} 
                        alt="Uploaded image"
                        className="max-w-xs rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(message.file_path, '_blank')}
                      />
                    </div>
                  )}

                  {message.type === 'video' && message.file_path && !message.metadata && (
                    <div className="mb-2">
                      <video 
                        src={message.file_path}
                        controls
                        className="max-w-xs rounded-lg"
                        preload="metadata"
                      >
                        Ваш браузер не поддерживает видео.
                      </video>
                    </div>
                  )}

                  {message.type === 'file' && message.file_path && (
                    <div className="mb-2 p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{message.file_name}</p>
                          <p className="text-sm text-white/60">
                            {message.file_size ? `${(message.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
                          </p>
                        </div>
                        <a 
                          href={message.file_path} 
                          download={message.file_name}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Скачать
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Показываем текст только если это НЕ медиа или есть дополнительный текст */}
                  {(message.type === 'text' || (message.content && !message.content.match(/^\[(Фото|Видео|Файл)/))) && (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className={`text-sm mt-1 ${
                    message.senderId === 'current-user' 
                      ? 'text-blue-100' 
                      : 'text-white/60'
                  }`}>
                    {formatTime(message.createdAt)}
                  </p>
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
        {uploading && (
          <div className="mb-2 text-center">
            <p className="text-white/60 text-sm">Загрузка файла...</p>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />
          <button
            type="button"
            onClick={handleImageButtonClick}
            className="glass-button p-2 cursor-pointer inline-flex items-center justify-center"
          >
            <Image className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="glass-input w-full"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!newMessage.trim() || uploading}
            className="glass-button p-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.form>
    </div>
  )
}

export default ChatPage
