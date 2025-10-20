// Общие типы для всех частей системы MebelPlace
// Синхронизировано на основе client/src/types/index.ts

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginationResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// ============================================
// User Types
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'client' | 'master' | 'admin';
  isOnline: boolean;
  lastSeen?: string;
  rating?: number;
  reviewsCount?: number;
  specialties?: string[];
  location?: {
    city: string;
    region: string;
  };
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Video Types
// ============================================
export interface Video {
  id: string;
  masterId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  master: User;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  content: string;
  parentId?: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  replies?: VideoComment[];
}

// ============================================
// Chat Types
// ============================================
export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'video';
  metadata?: any;
  isRead: boolean;
  createdAt: string;
  sender: User;
}

// ============================================
// Order Types
// ============================================
export interface Order {
  id: string;
  clientId: string;
  masterId?: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  location: {
    city: string;
    region: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  responses: OrderResponse[];
  createdAt: string;
  updatedAt: string;
  client: User;
  master?: User;
}

export interface OrderResponse {
  id: string;
  orderId: string;
  masterId: string;
  message: string;
  proposedPrice: number;
  estimatedTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  master: User;
}

// ============================================
// WebSocket Event Types
// ============================================
export interface WebSocketEvents {
  // Video events
  video_liked: {
    videoId: string;
    userId: string;
    isLiked: boolean;
    likesCount: number;
  };
  new_comment: {
    videoId: string;
    comment: {
      id: string;
      content: string;
      author: User;
      createdAt: string;
    };
  };
  
  // Chat events
  new_message: {
    chatId: string;
    message: Message;
  };
  typing_start: {
    chatId: string;
    userId: string;
    userName: string;
  };
  typing_stop: {
    chatId: string;
    userId: string;
    userName: string;
  };
  message_read: {
    chatId: string;
    messageId: string;
    userId: string;
  };
  
  // Order events
  new_order_response: {
    orderId: string;
    response: OrderResponse;
  };
  order_accepted: {
    orderId: string;
    masterId: string;
  };
  order_status_changed: {
    orderId: string;
    status: string;
  };
  
  // User events
  user_online: {
    userId: string;
    isOnline: boolean;
  };
}

// ============================================
// UI Types
// ============================================
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'hover' | 'active';
}

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

// ============================================
// Pagination & Filters
// ============================================
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  query?: string;
  category?: string;
  authorId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
}

export interface OrderFilters {
  status?: string;
  category?: string;
  clientId?: string;
  masterId?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface VideoFilters {
  category?: string;
  authorId?: string;
  isPublic?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
}

// ============================================
// File Upload Types
// ============================================
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUpload {
  file: File | any;
  progress: UploadProgress;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

// ============================================
// Notification Types
// ============================================
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ============================================
// Settings Types
// ============================================
export interface NotificationSettings {
  push: boolean;
  sms: boolean;
  email: boolean;
  newMessages: boolean;
  newOrders: boolean;
  newVideos: boolean;
  newComments: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'ru' | 'en' | 'kk';
  notifications: NotificationSettings;
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
    showLocation: boolean;
  };
}

// ============================================
// Socket Connection Types
// ============================================
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
