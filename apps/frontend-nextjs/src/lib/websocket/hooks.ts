/**
 * WebSocket React Hooks
 * React hooks for using WebSocket connections
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { WebSocketClient, WebSocketEventHandler } from './client';

/**
 * Hook to use WebSocket connection
 */
export function useWebSocket(
  client: WebSocketClient,
  autoConnect: boolean = true
) {
  const clientRef = useRef(client);

  useEffect(() => {
    if (autoConnect && !clientRef.current.isConnected()) {
      clientRef.current.connect();
    }

    return () => {
      if (autoConnect) {
        clientRef.current.disconnect();
      }
    };
  }, [autoConnect]);

  const on = useCallback((event: string, handler: WebSocketEventHandler) => {
    clientRef.current.on(event, handler);
  }, []);

  const off = useCallback((event: string, handler: WebSocketEventHandler) => {
    clientRef.current.off(event, handler);
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    clientRef.current.emit(event, data);
  }, []);

  const isConnected = useCallback(() => {
    return clientRef.current.isConnected();
  }, []);

  return {
    on,
    off,
    emit,
    isConnected,
    client: clientRef.current,
  };
}

/**
 * Hook to subscribe to WebSocket event
 */
export function useWebSocketEvent<T = unknown>(
  client: WebSocketClient,
  event: string,
  handler: (data: T) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const wrappedHandler = (data: unknown) => {
      handler(data as T);
    };

    client.on(event, wrappedHandler);

    return () => {
      client.off(event, wrappedHandler);
    };
  }, [client, event, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}

// Import WebSocket clients (lazy to avoid circular dependencies)
let chatWS: WebSocketClient | null = null;
let requestsWS: WebSocketClient | null = null;
let notificationsWS: WebSocketClient | null = null;

function getChatWebSocket(): WebSocketClient {
  if (!chatWS) {
    chatWS = new WebSocketClient({
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
      path: '/chats',
      autoConnect: false,
    });
  }
  return chatWS;
}

function getRequestsWebSocket(): WebSocketClient {
  if (!requestsWS) {
    requestsWS = new WebSocketClient({
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
      path: '/ws/requests',
      autoConnect: false,
    });
  }
  return requestsWS;
}

function getNotificationsWebSocket(): WebSocketClient {
  if (!notificationsWS) {
    notificationsWS = new WebSocketClient({
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
      path: '/ws/notifications',
      autoConnect: false,
    });
  }
  return notificationsWS;
}

/**
 * Hook for chat WebSocket functionality
 */
export function useChatWebSocket(chatId: number | null) {
  const { on, off, emit, isConnected, client } = useWebSocket(
    getChatWebSocket(),
    !!chatId
  );

  useEffect(() => {
    if (chatId && isConnected()) {
      // Join chat room
      emit('join_chat', { chat_id: chatId });

      return () => {
        // Leave chat room on unmount
        emit('leave_chat', { chat_id: chatId });
      };
    }
  }, [chatId, emit, isConnected]);

  const sendMessage = useCallback(
    (content: string, attachments?: File[]) => {
      if (!chatId) return;

      emit('send_message', {
        chat_id: chatId,
        content,
        attachments,
      });
    },
    [chatId, emit]
  );

  const markAsRead = useCallback(
    (messageIds: number[]) => {
      if (!chatId) return;

      emit('mark_read', {
        chat_id: chatId,
        message_ids: messageIds,
      });
    },
    [chatId, emit]
  );

  const startTyping = useCallback(() => {
    if (!chatId) return;
    emit('typing_start', { chat_id: chatId });
  }, [chatId, emit]);

  const stopTyping = useCallback(() => {
    if (!chatId) return;
    emit('typing_stop', { chat_id: chatId });
  }, [chatId, emit]);

  return {
    on,
    off,
    emit,
    isConnected,
    client,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
  };
}

/**
 * Hook for requests WebSocket functionality
 */
export function useRequestsWebSocket() {
  const { on, off, emit, isConnected, client } = useWebSocket(
    getRequestsWebSocket(),
    true
  );

  const subscribeToRequest = useCallback(
    (requestId: number) => {
      emit('subscribe_request', { request_id: requestId });
    },
    [emit]
  );

  const unsubscribeFromRequest = useCallback(
    (requestId: number) => {
      emit('unsubscribe_request', { request_id: requestId });
    },
    [emit]
  );

  return {
    on,
    off,
    emit,
    isConnected,
    client,
    subscribeToRequest,
    unsubscribeFromRequest,
  };
}

/**
 * Hook for notifications WebSocket (simple version)
 */
export function useNotificationsWebSocketSimple() {
  const { on, off, emit, isConnected, client } = useWebSocket(
    getNotificationsWebSocket(),
    true
  );

  return {
    on,
    off,
    emit,
    isConnected,
    client,
  };
}

/**
 * Hook to manage WebSocket connection
 */
export function useWebSocketConnection(url?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, send, messages };
}

/**
 * Hook to filter WebSocket messages by type
 */
export function useWebSocketMessages(messageType?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  
  const addMessage = useCallback((msg: any) => {
    if (!messageType || msg.type === messageType) {
      setMessages((prev) => [...prev, msg]);
    }
  }, [messageType]);

  return { messages, addMessage };
}

/**
 * Hook to manage typing indicator
 */
export function useTypingIndicator() {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback((userId: number) => {
    setTypingUsers((prev) => [...new Set([...prev, userId])]);
    setIsTyping(true);
  }, []);

  const stopTyping = useCallback((userId: number) => {
    setTypingUsers((prev) => prev.filter((id) => id !== userId));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const clearTyping = useCallback(() => {
    setIsTyping(false);
    setTypingUsers([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { isTyping, typingUsers, startTyping, stopTyping, clearTyping };
}

/**
 * Hook to manage user presence
 */
export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

  const setOnline = useCallback((userId: number) => {
    setOnlineUsers((prev) => [...new Set([...prev, userId])]);
  }, []);

  const setOffline = useCallback((userId: number) => {
    setOnlineUsers((prev) => prev.filter((id) => id !== userId));
  }, []);

  return { onlineUsers, setOnline, setOffline };
}

