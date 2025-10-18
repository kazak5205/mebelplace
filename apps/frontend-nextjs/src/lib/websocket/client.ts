/**
 * WebSocket Client
 * Handles real-time connections with automatic reconnection
 * Uses native WebSocket API
 */

export type WebSocketEventHandler = (data: unknown) => void;

export interface WebSocketConfig {
  url: string;
  path?: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(config: WebSocketConfig) {
    this.config = {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      ...config,
    };
    
    this.maxReconnectAttempts = this.config.reconnectionAttempts || 5;
    this.reconnectDelay = this.config.reconnectionDelay || 3000;

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;

    const url = this.config.url + (this.config.path || '');
    const wsUrl = token ? `${url}?token=${token}` : url;

    this.ws = new WebSocket(wsUrl);
    this.setupEventListeners();
  }

  /**
   * Setup internal event listeners
   */
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
      this.notifyHandlers('connection', { connected: true });
    };

    this.ws.onclose = (event) => {
      console.log('[WebSocket] Disconnected:', event.reason);
      this.notifyHandlers('connection', { connected: false, reason: event.reason });
      
      // Auto-reconnect if not manually closed
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.reconnectTimeout = setTimeout(() => {
          console.log(`[WebSocket] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.connect();
        }, this.reconnectDelay);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      this.notifyHandlers('error', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event && message.data !== undefined) {
          this.notifyHandlers(message.event, message.data);
        }
      } catch (err) {
        console.error('[WebSocket] Failed to parse message:', err);
      }
    };
  }

  /**
   * Notify all handlers for an event
   */
  private notifyHandlers(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      // Store reference
      const wsToClose = this.ws;
      
      // Set to null FIRST (so isConnected() immediately returns false)
      this.ws = null;
      
      // Then close the WebSocket
      wsToClose.onopen = null;
      wsToClose.onclose = null;
      wsToClose.onerror = null;
      wsToClose.onmessage = null;
      wsToClose.close(1000, 'Client disconnect');
    }
  }

  /**
   * Subscribe to an event
   */
  on(event: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)?.add(handler);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler: WebSocketEventHandler): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  /**
   * Emit an event to server
   */
  emit(event: string, data?: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    } else {
      console.warn('[WebSocket] Not connected, cannot emit event:', event);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get socket ID (not applicable for native WebSocket)
   */
  getSocketId(): string | undefined {
    return undefined;
  }
}

// Create default instances for different channels
export const chatWebSocket = new WebSocketClient({
  url: process.env.NEXT_PUBLIC_WS_URL || 'wss://mebelplace.com.kz',
  path: '/ws/chats',
  autoConnect: false, // Connect manually when needed
});

export const requestsWebSocket = new WebSocketClient({
  url: process.env.NEXT_PUBLIC_WS_URL || 'wss://mebelplace.com.kz',
  path: '/ws/requests',
  autoConnect: false,
});

export const notificationsWebSocket = new WebSocketClient({
  url: process.env.NEXT_PUBLIC_WS_URL || 'wss://mebelplace.com.kz',
  path: '/ws/notifications',
  autoConnect: false,
});

