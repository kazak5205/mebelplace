// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// Company Type для мастеров
export type CompanyType = 'master' | 'company' | 'shop';

// User Types
export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  // Поля для мебельных компаний (role='master')
  companyName?: string;
  companyAddress?: string;
  companyDescription?: string;
  companyType?: CompanyType; // Тип компании: мастер / цех / магазин
  company_type?: string; // snake_case для API
  avatar?: string;
  role: 'user' | 'master' | 'admin'; // 'user' это обычный клиент
  isOnline?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  lastSeen?: string;
  phone?: string;
  rating?: number;
  reviewsCount?: number;
  specialties?: string[];
  location?: {
    city: string;
    region: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// Video Types
export interface Video {
  id: string;
  masterId?: string;
  authorId?: string;
  author_id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  company_name?: string;
  avatar?: string;
  role?: 'user' | 'master' | 'admin';
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  likes?: number;
  likesCount?: number;
  likeCount?: number | string;
  commentsCount?: number;
  commentCount?: number;
  viewsCount?: number;
  views?: number;
  isLiked?: boolean;
  tags: string[];
  furniturePrice?: number;
  furniture_price?: number;
  createdAt: string;
  updatedAt?: string;
  master?: User;
}

// Chat Types
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
  file_path?: string;
  file_name?: string;
  file_size?: number;
  isRead: boolean;
  createdAt: string;
  sender: User;
}

// Order Types
export interface Order {
  id: string;
  clientId: string;
  masterId?: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  price?: number;
  deadline?: string;
  region?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  location?: {
    city?: string;
    region?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  responses?: OrderResponse[];
  responseCount?: number;
  response_count?: number;
  hasMyResponse?: boolean;
  has_my_response?: boolean;
  createdAt: string;
  updatedAt?: string;
  client?: User;
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

// WebSocket Event Types
export interface WebSocketEvents {
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
  new_message: {
    chatId: string;
    message: Message;
  };
  new_order_response: {
    orderId: string;
    response: OrderResponse;
  };
  order_accepted: {
    orderId: string;
    masterId: string;
  };
  user_online: {
    userId: string;
    isOnline: boolean;
  };
}

// UI Types
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
