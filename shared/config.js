// Общая конфигурация для всех частей системы
const config = {
  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://mebelplace.com.kz/api',
    wsUrl: process.env.WS_URL || 'wss://mebelplace.com.kz',
    timeout: 30000
  },

  // Web Push Configuration
  push: {
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI0F8yVgK1eQ_O4VXQ9UYtWNf-Tew1_YhR0k7B1S8KVfU6Sx1gEo7B0Vk',
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || 'p256dh'
  },

  // SMS Configuration
  sms: {
    apiKey: process.env.SMS_API_KEY || 'kza709b533060de72b09110d34ca60bee25bad4fd53e2bb6181fe47cb8a7cad16cb0b1',
    sender: 'MebelPlace'
  },

  // Video Configuration
  video: {
    maxSize: 200 * 1024 * 1024, // 200MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    thumbnailSize: { width: 320, height: 240 }
  },

  // Chat Configuration
  chat: {
    maxMessageLength: 1000,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg']
  },

  // Order Configuration
  order: {
    maxImages: 5,
    maxImageSize: 10 * 1024 * 1024, // 10MB
    categories: [
      { id: 'furniture', name: 'Мебель', description: 'Изготовление и ремонт мебели' },
      { id: 'carpentry', name: 'Столярные работы', description: 'Работы по дереву' },
      { id: 'upholstery', name: 'Обивка мебели', description: 'Перетяжка и реставрация' },
      { id: 'restoration', name: 'Реставрация', description: 'Восстановление старинной мебели' },
      { id: 'custom', name: 'На заказ', description: 'Индивидуальное изготовление' },
      { id: 'repair', name: 'Ремонт', description: 'Ремонт и восстановление' },
      { id: 'other', name: 'Другое', description: 'Прочие работы' }
    ]
  },

  // User Roles
  roles: {
    GUEST: 'guest',
    USER: 'user',
    MASTER: 'master',
    ADMIN: 'admin'
  },

  // Order Statuses
  orderStatuses: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Message Types
  messageTypes: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    FILE: 'file',
    STICKER: 'sticker',
    VOICE: 'voice'
  },

  // Notification Types
  notificationTypes: {
    ORDER_RESPONSE: 'order_response',
    NEW_MESSAGE: 'new_message',
    RESPONSE_ACCEPTED: 'response_accepted',
    NEW_VIDEO: 'new_video',
    NEW_SUBSCRIBER: 'new_subscriber',
    NEW_COMMENT: 'new_comment',
    SYSTEM: 'system'
  },

  // WebSocket Events
  wsEvents: {
    // Video Events
    VIDEO_LIKE: 'video_like',
    VIDEO_COMMENT: 'video_comment',
    VIDEO_VIEW: 'video_view',
    VIDEO_SHARE: 'video_share',
    VIDEO_UPLOADED: 'video_uploaded',
    
    // Chat Events
    JOIN_CHAT: 'join_chat',
    LEAVE_CHAT: 'leave_chat',
    SEND_MESSAGE: 'send_message',
    TYPING_START: 'typing_start',
    TYPING_STOP: 'typing_stop',
    
    // Order Events
    NEW_ORDER: 'new_order',
    ORDER_RESPONSE: 'order_response',
    ORDER_ACCEPTED: 'order_accepted',
    
    // Notification Events
    NEW_NOTIFICATION: 'new_notification',
    NOTIFICATION_READ: 'notification_read'
  },

  // API Endpoints
  endpoints: {
    // Auth
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    
    // Videos
    VIDEO_UPLOAD: '/videos/upload',
    VIDEO_FEED: '/videos/feed',
    VIDEO_LIKE: '/videos/:id/like',
    VIDEO_COMMENT: '/videos/:id/comment',
    
    // Orders
    ORDER_CREATE: '/orders/create',
    ORDER_FEED: '/orders/feed',
    ORDER_RESPONSE: '/orders/:id/response',
    ORDER_ACCEPT: '/orders/:id/accept',
    
    // Chat
    CHAT_CREATE: '/chat/create',
    CHAT_LIST: '/chat/list',
    CHAT_MESSAGES: '/chat/:id/messages',
    CHAT_SEND_MESSAGE: '/chat/:id/message',
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    PUSH_SUBSCRIBE: '/push/subscribe',
    PUSH_VAPID_KEY: '/push/vapid-key'
  },

  // Error Messages
  errors: {
    NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
    AUTH_REQUIRED: 'Требуется авторизация',
    ACCESS_DENIED: 'Доступ запрещен',
    INVALID_DATA: 'Неверные данные',
    FILE_TOO_LARGE: 'Файл слишком большой',
    UNSUPPORTED_FILE_TYPE: 'Неподдерживаемый тип файла',
    USER_NOT_FOUND: 'Пользователь не найден',
    ORDER_NOT_FOUND: 'Заявка не найдена',
    CHAT_NOT_FOUND: 'Чат не найден'
  },

  // Success Messages
  success: {
    ORDER_CREATED: 'Заявка создана успешно',
    RESPONSE_SENT: 'Отклик отправлен',
    RESPONSE_ACCEPTED: 'Отклик принят',
    MESSAGE_SENT: 'Сообщение отправлено',
    VIDEO_UPLOADED: 'Видео загружено',
    PROFILE_UPDATED: 'Профиль обновлен'
  }
};

module.exports = config;

