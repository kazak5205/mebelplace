'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { logger } from '@/lib/logger'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface UseWebSocketReturn {
  isConnected: boolean
  sendMessage: (type: string, data: any) => void
  lastMessage: WebSocketMessage | null
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const { user, isAuthenticated } = useAuth()
  const ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    if (!isAuthenticated || !user) return

    try {
      const token = localStorage.getItem('access_token')
      const wsUrl = `${url}?token=${token}`
      
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        logger.info('WebSocket connected')
        setIsConnected(true)
        reconnectAttempts.current = 0
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          
          // Handle different message types
          switch (message.type) {
            case 'notification':
              // Show notification
              logger.info('WebSocket notification received', { data: message.data })
              break
            case 'chat_message':
              // Update chat
              logger.info('WebSocket chat message received', { data: message.data })
              break
            case 'request_update':
              // Update requests
              logger.info('WebSocket request update received', { data: message.data })
              break
            default:
              logger.warn('Unknown WebSocket message type', { type: message.type })
          }
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error instanceof Error ? error : new Error(String(error)))
        }
      }

      ws.current.onclose = () => {
        logger.info('WebSocket disconnected')
        setIsConnected(false)
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
          
          reconnectTimeout.current = setTimeout(() => {
            logger.info('Attempting WebSocket reconnection', { attempt: reconnectAttempts.current, max: maxReconnectAttempts })
            connect()
          }, delay)
        }
      }

      ws.current.onerror = (error) => {
        logger.error('WebSocket error', error instanceof Error ? error : new Error(String(error)))
        setIsConnected(false)
      }
    } catch (error) {
      logger.error('Failed to create WebSocket connection', error instanceof Error ? error : new Error(String(error)))
    }
  }

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
      reconnectTimeout.current = null
    }
    
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }
    
    setIsConnected(false)
  }

  const sendMessage = (type: string, data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString()
      }
      
      ws.current.send(JSON.stringify(message))
    } else {
      logger.warn('WebSocket is not connected')
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, user, url])

  return {
    isConnected,
    sendMessage,
    lastMessage
  }
}

// Hook for chat WebSocket
export function useChatWebSocket(chatId: string | number) {
  const baseUrl = typeof window !== 'undefined' 
    ? `wss://${window.location.host}/api/v2/ws/chat/${chatId}`
    : ''
  
  return useWebSocket(baseUrl)
}

// Hook for notifications WebSocket
export function useNotificationsWebSocket() {
  const baseUrl = typeof window !== 'undefined' 
    ? `wss://${window.location.host}/api/v2/ws/notifications`
    : ''
  
  return useWebSocket(baseUrl)
}
