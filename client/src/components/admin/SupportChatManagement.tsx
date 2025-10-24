import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  User, 
  Clock, 
  Send, 
  // Eye, 
  // EyeOff,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { apiService } from '../../services/api'

interface SupportChat {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  last_message: string
  last_message_time: string
  unread_count: number
  client_username: string
  user_role: string
  last_read_at: string
}

interface Message {
  id: string
  content: string
  type: string
  sender_id: string
  created_at: string
  sender_username: string
  sender_avatar: string
  reply_to?: string
  metadata?: any
}

const SupportChatManagement: React.FC = () => {
  const [chats, setChats] = useState<SupportChat[]>([])
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadSupportChats()
  }, [statusFilter])

  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat.id)
    }
  }, [selectedChat])

  const loadSupportChats = async () => {
    try {
      setLoading(true)
      const response = await apiService.get(`/chat/admin/support-chats?status=${statusFilter}`) as any
      if (response.success) {
        setChats(response.data.chats)
      }
    } catch (error) {
      console.error('Failed to load support chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChatMessages = async (chatId: string) => {
    try {
      const response = await apiService.get(`/chat/${chatId}/messages`) as any
      if (response.success) {
        setMessages(response.data)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat || sending) return

    try {
      setSending(true)
      const response = await apiService.post(`/chat/${selectedChat.id}/message`, {
        content: newMessage,
        type: 'text'
      }) as any

      if (response.success) {
        setNewMessage('')
        // Reload messages
        await loadChatMessages(selectedChat.id)
        // Reload chats to update last message
        await loadSupportChats()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const markAsRead = async (chatId: string) => {
    try {
      await apiService.put(`/chat/${chatId}/read`)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes}м назад`
    if (hours < 24) return `${hours}ч назад`
    if (days < 7) return `${days}д назад`
    return date.toLocaleDateString('ru-RU')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Чаты поддержки</h2>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Все чаты</option>
            <option value="unread">Непрочитанные</option>
          </select>
          <button
            onClick={loadSupportChats}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Обновить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список чатов */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-white">Активные чаты</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  Нет активных чатов
                </div>
              ) : (
                chats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-700 ${
                      selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => {
                      setSelectedChat(chat)
                      markAsRead(chat.id)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-white">
                            {chat.client_username}
                          </span>
                          {chat.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {chat.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                          {chat.last_message || 'Нет сообщений'}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {formatTime(chat.last_message_time)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Чат */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <div className="bg-gray-800 rounded-lg shadow-sm border h-96 flex flex-col">
              {/* Заголовок чата */}
              <div className="p-4 border-b bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-white">
                        {selectedChat.client_username}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Чат поддержки
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedChat.unread_count > 0 ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    Нет сообщений
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.sender_username === 'admin' || message.sender_username?.includes('admin') ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_username === 'admin' || message.sender_username?.includes('admin')
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Форма отправки */}
              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-3 py-2 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'Отправка...' : 'Отправить'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-sm border h-96 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Выберите чат для просмотра сообщений</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupportChatManagement
