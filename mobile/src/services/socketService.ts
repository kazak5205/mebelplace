// Socket.IO клиент для мобильного приложения
import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

export interface SocketConnection {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastConnected?: string;
  lastDisconnected?: string;
}

export interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: string;
}

export class SocketService extends EventEmitter {
  private socket: Socket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private connectionState: SocketConnection = {
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
  };

  constructor(url: string) {
    super();
    this.url = url;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const options: any = {
          transports: ['websocket'],
          timeout: 20000,
        };

        if (this.token) {
          options.auth = { token: this.token };
        }

        this.socket = io(this.url, options);

        this.socket.on('connect', () => {
          console.log('Socket.IO connected');
          this.connectionState = {
            isConnected: true,
            isReconnecting: false,
            reconnectAttempts: 0,
            lastConnected: new Date().toISOString(),
          };
          this.reconnectAttempts = 0;
          this.emit('connection', { connected: true });
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket.IO disconnected:', reason);
          this.connectionState = {
            ...this.connectionState,
            isConnected: false,
            lastDisconnected: new Date().toISOString(),
          };
          this.emit('connection', { connected: false });

          if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          this.emit('error', error);
          reject(error);
        });

        // Обработка всех входящих событий
        this.socket.onAny((event, ...args) => {
          this.emit(event, ...args);
        });

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
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionState = {
      isConnected: false,
      isReconnecting: false,
      reconnectAttempts: 0,
    };
  }

  send(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket.IO is not connected');
    }
  }

  getConnectionState(): SocketConnection {
    return { ...this.connectionState };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Специализированные методы для MebelPlace
export class MebelPlaceSocketService extends SocketService {
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

// Создание экземпляра Socket.IO клиента
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://mebelplace.com.kz';
export const socketService = new MebelPlaceSocketService(SOCKET_URL);

// Утилиты для работы с Socket.IO
export const socketUtils = {
  // Подключение с автоматической авторизацией
  async connectWithAuth(token: string): Promise<void> {
    socketService.setToken(token);
    await socketService.connect();
  },

  // Отключение
  disconnect(): void {
    socketService.disconnect();
  },

  // Проверка состояния подключения
  isConnected(): boolean {
    return socketService.isConnected();
  },

  // Получение состояния подключения
  getConnectionState(): SocketConnection {
    return socketService.getConnectionState();
  },

  // Подписка на события
  on(event: string, handler: Function): void {
    socketService.on(event, handler);
  },

  // Отписка от событий
  off(event: string, handler?: Function): void {
    socketService.off(event, handler);
  },

  // Отправка сообщения
  send(event: string, data: any): void {
    socketService.send(event, data);
  }
};

export default socketService;
