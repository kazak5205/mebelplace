import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import type { WebSocketEvents } from '@shared/types'
import { useAuth } from '@shared/contexts/AuthContext'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  emit: (event: string, data: any) => void
  on: (event: keyof WebSocketEvents, callback: (data: any) => void) => void
  off: (event: keyof WebSocketEvents, callback: (data: any) => void) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://mebelplace.com.kz'
      const newSocket = io(socketUrl, {
        auth: {
          token: localStorage.getItem('authToken')
        },
        transports: ['websocket']
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  const emit = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }

  const on = (event: keyof WebSocketEvents, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event: keyof WebSocketEvents, callback: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback)
    }
  }

  const value = {
    socket,
    isConnected,
    emit,
    on,
    off
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
