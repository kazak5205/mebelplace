import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, Image, Paperclip, Smile } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { Chat, Message } from '../types'
import { chatService } from '../services/chatService'
import { useSocket } from '../contexts/SocketContext'

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { emit, on } = useSocket()

  useEffect(() => {
    if (id) {
      loadChat()
      loadMessages()
    }
  }, [id])

  useEffect(() => {
    // Listen for new messages
    on('new_message', (data) => {
      if (data.chatId === id) {
        setMessages(prev => [...prev, data.message])
        scrollToBottom()
      }
    })
  }, [id, on])

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
      const message = await chatService.sendMessage(id, newMessage.trim())
      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
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
    <div className="h-[calc(100vh-8rem)] flex flex-col">
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
                const participant = chat.participants[0]
                if (participant?.role === 'master') {
                  navigate(`/master/${participant.id}`)
                }
              }}
              className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold"
              aria-label="Канал мастера"
            >
              {chat.participants[0]?.name.charAt(0).toUpperCase()}
            </button>
            {chat.participants[0]?.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
            )}
          </div>

          <div>
            <h3 className="font-medium text-white">
              {chat.participants[0]?.name}
            </h3>
            <p className="text-sm text-white/60">
              {chat.participants[0]?.isOnline ? 'В сети' : 'Был(а) в сети недавно'}
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
                className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === 'current-user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
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

      {/* Message Input */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSendMessage}
        className="glass-card p-4 mt-4"
      >
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="glass-button p-2"
          >
            <Image className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            className="glass-button p-2"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="glass-input w-full pr-12"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="w-5 h-5 text-white/60" />
            </button>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!newMessage.trim()}
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
