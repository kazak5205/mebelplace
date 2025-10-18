import { useEffect, useRef, useState, useCallback } from 'react'

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'call_offer' | 'call_answer' | 'call_candidate' | 'read_receipt'
  chat_id?: string
  message_id?: string
  sender_id: string
  recipients: string[]
  content?: string
  data?: any
  timestamp: string
}

export const useWebSocket = (url: string, onMessage: (message: WebSocketMessage) => void) => {
  const ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const reconnectTimeout = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    const socket = new WebSocket(url)

    socket.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage
        onMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    socket.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeout.current = setTimeout(() => {
        console.log('Attempting to reconnect...')
        connect()
      }, 3000)
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.current = socket
  }, [url, onMessage])

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }
  }, [])

  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
      }))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { isConnected, sendMessage, disconnect }
}

