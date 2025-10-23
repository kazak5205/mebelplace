// WebSocket клиент для real-time коммуникации

import { WebSocketMessage, SocketConnection } from '../types';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private eventHandlers: Map<string, Function[]> = new Map();
  private connectionState: SocketConnection = {
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
  };

  constructor(url: string) {
    this.url = url;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.token ? `${this.url}?token=${this.token}` : this.url;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.connectionState = {
            isConnected: true,
            isReconnecting: false,
            reconnectAttempts: 0,
            lastConnected: new Date().toISOString(),
          };
          this.reconnectAttempts = 0;
          this.emit('connection', { connected: true });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.emit(message.event, message.data);
          } catch (error) {
            console.error('WebSocket message parse error:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.connectionState = {
            ...this.connectionState,
            isConnected: false,
            lastDisconnected: new Date().toISOString(),
          };
          this.emit('connection', { connected: false });

          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private reconnect() {
    if (this.connectionState.isReconnecting) return;

    this.connectionState.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(() => {
        this.connectionState.isReconnecting = false;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        } else {
          console.error('Max reconnection attempts reached');
          this.emit('maxReconnectAttemptsReached', null);
        }
      });
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.connectionState = {
      isConnected: false,
      isReconnecting: false,
      reconnectAttempts: 0,
    };
  }

  send(event: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        event,
        data,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler?: Function) {
    if (!this.eventHandlers.has(event)) return;

    if (handler) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  getConnectionState(): SocketConnection {
    return { ...this.connectionState };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Специализированные методы для MebelPlace
export class MebelPlaceWebSocket extends WebSocketClient {
  constructor(url: string) {
    super(url);
  }

  // Video events
  joinVideo(videoId: string) {
    this.send('join_video', { videoId });
  }

  leaveVideo(videoId: string) {
    this.send('leave_video', { videoId });
  }

  likeVideo(videoId: string) {
    this.send('video_like', { videoId });
  }

  commentVideo(videoId: string, content: string, parentId?: string) {
    this.send('video_comment', { videoId, content, parentId });
  }

  viewVideo(videoId: string) {
    this.send('video_view', { videoId });
  }

  shareVideo(videoId: string, platform: string) {
    this.send('video_share', { videoId, platform });
  }

  // Chat events
  joinChat(chatId: string) {
    this.send('join_chat', { chatId });
  }

  leaveChat(chatId: string) {
    this.send('leave_chat', { chatId });
  }

  sendMessage(chatId: string, content: string, type: string = 'text', replyTo?: string) {
    this.send('send_message', { chatId, content, type, replyTo });
  }

  startTyping(chatId: string) {
    this.send('typing_start', { chatId });
  }

  stopTyping(chatId: string) {
    this.send('typing_stop', { chatId });
  }

  // Order events
  notifyNewOrder(orderId: string, title: string, category: string) {
    this.send('new_order', { orderId, title, category });
  }

  respondToOrder(orderId: string, message: string, price?: number, deadline?: string) {
    this.send('order_response', { orderId, message, price, deadline });
  }

  acceptResponse(orderId: string, responseId: string) {
    this.send('order_accepted', { orderId, responseId });
  }

  // Notification events
  markNotificationAsRead(notificationId: string) {
    this.send('notification_read', { notificationId });
  }
}

// Создание экземпляра WebSocket клиента
const WS_URL = process.env.REACT_APP_WS_URL || 'wss://mebelplace.com.kz';
export const wsClient = new MebelPlaceWebSocket(WS_URL);

// Утилиты для работы с WebSocket
export const wsUtils = {
  // Подключение с автоматической авторизацией
  async connectWithAuth(token: string): Promise<void> {
    wsClient.setToken(token);
    await wsClient.connect();
  },

  // Отключение
  disconnect(): void {
    wsClient.disconnect();
  },

  // Проверка состояния подключения
  isConnected(): boolean {
    return wsClient.isConnected();
  },

  // Получение состояния подключения
  getConnectionState(): SocketConnection {
    return wsClient.getConnectionState();
  },

  // Подписка на события
  on(event: string, handler: Function): void {
    wsClient.on(event, handler);
  },

  // Отписка от событий
  off(event: string, handler?: Function): void {
    wsClient.off(event, handler);
  },

  // Отправка сообщения
  send(event: string, data: any): void {
    wsClient.send(event, data);
  }
};

export default wsClient;

