import { io, Socket } from 'socket.io-client';
import { store } from '@/lib/store';
import { 
  addMessage, 
  updateChatLastMessage, 
  incrementUnreadCount,
  setIncomingCall,
  clearIncomingCall,
  updateCallStatus,
  addCallToHistory,
  updateCallDuration,
  addNotification,
  updateUnreadCount,
  addStory,
  updateStoryLike,
  incrementStoryViews,
} from '@/lib/store/slices';

// WebSocket types
export interface WebSocketEvents {
  // Chat events
  'chat:message': (message: any) => void;
  'chat:typing': (data: { chatId: number; userId: number; isTyping: boolean }) => void;
  'chat:user_online': (data: { userId: number; isOnline: boolean }) => void;
  
  // Call events
  'call:incoming': (call: any) => void;
  'call:answered': (data: { callId: number; status: string }) => void;
  'call:ended': (data: { callId: number; duration: number }) => void;
  'call:rejected': (data: { callId: number }) => void;
  'call:webrtc_signal': (data: { callId: number; signal: any }) => void;
  
  // Notification events
  'notification:new': (notification: any) => void;
  'notification:read': (data: { notificationId: number }) => void;
  
  // Video events
  'video:like': (data: { videoId: number; userId: number; isLiked: boolean; likesCount: number }) => void;
  'video:comment': (data: { videoId: number; comment: any }) => void;
  'video:view': (data: { videoId: number; userId: number }) => void;
  
  // Story events
  'story:new': (story: any) => void;
  'story:like': (data: { storyId: number; userId: number; isLiked: boolean; likesCount: number }) => void;
  'story:view': (data: { storyId: number; userId: number }) => void;
  
  // Request events
  'request:new': (request: any) => void;
  'request:offer': (data: { requestId: number; offer: any }) => void;
  'request:accepted': (data: { requestId: number; offerId: number }) => void;
  
  // System events
  'connect': () => void;
  'disconnect': () => void;
  'error': (error: any) => void;
}

class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || this.socket?.connected) {
      return;
    }

    this.isConnecting = true;
    const state = store.getState();
    const token = state.auth.accessToken;

    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      this.isConnecting = false;
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://mebelplace.com.kz';
    
    this.socket = io(wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.isConnecting = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.isConnecting = false;
      this.handleReconnect();
    });

    // Chat events
    this.socket.on('chat:message', (message) => {
      console.log('💬 New chat message:', message);
      store.dispatch(addMessage(message));
      store.dispatch(updateChatLastMessage({
        chatId: message.chat_id,
        message,
      }));
      
      // Increment unread count if not current chat
      const currentChat = store.getState().chat.currentChat;
      if (!currentChat || currentChat.id !== message.chat_id) {
        store.dispatch(incrementUnreadCount(message.chat_id));
      }
    });

    this.socket.on('chat:typing', (data) => {
      console.log('⌨️ User typing:', data);
      // Handle typing indicator
    });

    this.socket.on('chat:user_online', (data) => {
      console.log('🟢 User online status:', data);
      // Handle user online status
    });

    // Call events
    this.socket.on('call:incoming', (call) => {
      console.log('📞 Incoming call:', call);
      store.dispatch(setIncomingCall(call));
    });

    this.socket.on('call:answered', (data) => {
      console.log('📞 Call answered:', data);
      store.dispatch(updateCallStatus(data));
    });

    this.socket.on('call:ended', (data) => {
      console.log('📞 Call ended:', data);
      store.dispatch(updateCallDuration(data));
      store.dispatch(addCallToHistory(data));
    });

    this.socket.on('call:rejected', (data) => {
      console.log('📞 Call rejected:', data);
      store.dispatch(updateCallStatus({ callId: data.callId, status: 'rejected' }));
    });

    this.socket.on('call:webrtc_signal', (data) => {
      console.log('📞 WebRTC signal:', data);
      // Handle WebRTC signaling
    });

    // Notification events
    this.socket.on('notification:new', (notification) => {
      console.log('🔔 New notification:', notification);
      store.dispatch(addNotification(notification));
      store.dispatch(updateUnreadCount(
        store.getState().notification.unreadCount + 1
      ));
    });

    this.socket.on('notification:read', (data) => {
      console.log('🔔 Notification read:', data);
      // Handle notification read
    });

    // Video events
    this.socket.on('video:like', (data) => {
      console.log('👍 Video like:', data);
      // Handle video like updates
    });

    this.socket.on('video:comment', (data) => {
      console.log('💬 Video comment:', data);
      // Handle new video comment
    });

    this.socket.on('video:view', (data) => {
      console.log('👁️ Video view:', data);
      // Handle video view
    });

    // Story events
    this.socket.on('story:new', (story) => {
      console.log('📖 New story:', story);
      store.dispatch(addStory(story));
    });

    this.socket.on('story:like', (data) => {
      console.log('👍 Story like:', data);
      store.dispatch(updateStoryLike(data));
    });

    this.socket.on('story:view', (data) => {
      console.log('👁️ Story view:', data);
      store.dispatch(incrementStoryViews(data.storyId));
    });

    // Request events
    this.socket.on('request:new', (request) => {
      console.log('📋 New request:', request);
      // Handle new request
    });

    this.socket.on('request:offer', (data) => {
      console.log('💼 Request offer:', data);
      // Handle new offer
    });

    this.socket.on('request:accepted', (data) => {
      console.log('✅ Request accepted:', data);
      // Handle accepted offer
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔌 Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔌 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Public methods
  public emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
    }
  }

  public joinRoom(room: string) {
    this.emit('join_room', { room });
  }

  public leaveRoom(room: string) {
    this.emit('leave_room', { room });
  }

  public sendChatMessage(chatId: number, content: string, messageType: string = 'text') {
    this.emit('chat:send_message', {
      chat_id: chatId,
      content,
      message_type: messageType,
    });
  }

  public sendTyping(chatId: number, isTyping: boolean) {
    this.emit('chat:typing', {
      chat_id: chatId,
      is_typing: isTyping,
    });
  }

  public initiateCall(calleeId: number, type: 'audio' | 'video') {
    this.emit('call:initiate', {
      callee_id: calleeId,
      type,
    });
  }

  public answerCall(callId: number) {
    this.emit('call:answer', { call_id: callId });
  }

  public endCall(callId: number) {
    this.emit('call:end', { call_id: callId });
  }

  public rejectCall(callId: number) {
    this.emit('call:reject', { call_id: callId });
  }

  public sendWebRTCSignal(callId: number, signal: any) {
    this.emit('call:webrtc_signal', {
      call_id: callId,
      signal,
    });
  }

  public likeVideo(videoId: number) {
    this.emit('video:like', { video_id: videoId });
  }

  public unlikeVideo(videoId: number) {
    this.emit('video:unlike', { video_id: videoId });
  }

  public viewVideo(videoId: number) {
    this.emit('video:view', { video_id: videoId });
  }

  public likeStory(storyId: number) {
    this.emit('story:like', { story_id: storyId });
  }

  public viewStory(storyId: number) {
    this.emit('story:view', { story_id: storyId });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
export const wsManager = new WebSocketManager();

// Export for use in components
export default wsManager;