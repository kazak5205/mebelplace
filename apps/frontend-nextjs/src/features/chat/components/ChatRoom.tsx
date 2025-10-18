'use client'

import { useState, useEffect, useRef } from 'react'
import { useWebSocket, WebSocketMessage } from '../hooks/useWebSocket'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  read_by: string[]
}

interface ChatRoomProps {
  chatId: string
  userId: string
  participants: string[]
  onStartVideoCall?: () => void
  onStartVoiceCall?: () => void
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  chatId,
  userId,
  participants,
  onStartVideoCall,
  onStartVoiceCall,
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    if (message.chat_id !== chatId) return

    switch (message.type) {
      case 'message':
        setMessages((prev) => [
          ...prev,
          {
            id: message.message_id || '',
            sender_id: message.sender_id,
            content: message.content || '',
            created_at: message.timestamp,
            read_by: [message.sender_id],
          },
        ])
        scrollToBottom()
        break

      case 'typing':
        if (message.sender_id !== userId) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev)
            if (message.data?.is_typing) {
              newSet.add(message.sender_id)
            } else {
              newSet.delete(message.sender_id)
            }
            return newSet
          })
        }
        break

      case 'read_receipt':
        // Update read status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.message_id
              ? { ...msg, read_by: [...msg.read_by, message.sender_id] }
              : msg
          )
        )
        break
    }
  }

  const { sendMessage } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}/v2/ws`,
    handleWebSocketMessage
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    sendMessage({
      type: 'message',
      chat_id: chatId,
      sender_id: userId,
      recipients: participants,
      content: inputValue,
    })

    setInputValue('')
    setIsTyping(false)
    sendTypingIndicator(false)
  }

  const sendTypingIndicator = (typing: boolean) => {
    sendMessage({
      type: 'typing',
      chat_id: chatId,
      sender_id: userId,
      recipients: participants.filter((id) => id !== userId),
      data: { is_typing: typing },
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    if (!isTyping) {
      setIsTyping(true)
      sendTypingIndicator(true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTypingIndicator(false)
    }, 2000)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Чат</h2>
          {typingUsers.size > 0 && (
            <p className="text-sm text-gray-500">печатает...</p>
          )}
        </div>
        <div className="flex gap-2">
          {onStartVoiceCall && (
            <button
              onClick={onStartVoiceCall}
              className="p-2 text-2xl hover:bg-gray-100 rounded-full transition-colors"
              title="Голосовой звонок"
            >
              📞
            </button>
          )}
          {onStartVideoCall && (
            <button
              onClick={onStartVideoCall}
              className="p-2 text-2xl hover:bg-gray-100 rounded-full transition-colors"
              title="Видеозвонок"
            >
              📹
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.sender_id === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              <p>{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {msg.sender_id === userId && msg.read_by.length > 1 && ' ✓✓'}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Напишите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  )
}

