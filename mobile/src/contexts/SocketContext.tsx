import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@shared/contexts/AuthContext';
import { Alert } from 'react-native';
import { API_CONFIG } from '../config/environment';
import type { WebSocketEvents } from '@shared/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: keyof WebSocketEvents | string, callback: (data: any) => void) => void;
  off: (event: keyof WebSocketEvents | string, callback?: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      initializeSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);

  const initializeSocket = () => {
    try {
      const newSocket = io(API_CONFIG.SOCKET_URL, {
        auth: {
          token,
          userId: user?.id,
        },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // WebSocket события из спецификации
      newSocket.on('video_liked', (data) => {
        console.log('Video liked:', data);
        // Обработка лайка видео
      });

      newSocket.on('new_comment', (data) => {
        console.log('New comment:', data);
        // Обработка нового комментария
      });

      newSocket.on('new_message', (data) => {
        console.log('New message:', data);
        // Обработка нового сообщения
      });

      newSocket.on('new_order_response', (data) => {
        console.log('New order response:', data);
        // Обработка нового отклика на заявку
      });

      newSocket.on('order_accepted', (data) => {
        console.log('Order accepted:', data);
        // Обработка принятия заявки
      });

      newSocket.on('user_online', (data) => {
        console.log('User online:', data);
        // Обработка статуса пользователя онлайн
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const emit = (event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.removeAllListeners(event);
      }
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
