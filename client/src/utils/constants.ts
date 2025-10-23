// User Roles
export const USER_ROLES = {
  CLIENT: 'client',
  MASTER: 'master', 
  ADMIN: 'admin'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Order Statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES]

// Order Status Labels (Russian)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'Открытые',
  [ORDER_STATUSES.ACCEPTED]: 'Принятые', 
  [ORDER_STATUSES.IN_PROGRESS]: 'В работе',
  [ORDER_STATUSES.COMPLETED]: 'Завершено',
  [ORDER_STATUSES.CANCELLED]: 'Отменено'
}

// Order Status Labels for Clients
export const CLIENT_ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'Открытые',
  [ORDER_STATUSES.ACCEPTED]: 'Ожидают',
  [ORDER_STATUSES.IN_PROGRESS]: 'В работе', 
  [ORDER_STATUSES.COMPLETED]: 'Завершено',
  [ORDER_STATUSES.CANCELLED]: 'Отменено'
}

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/simple-login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  VIDEOS: {
    LIST: '/api/videos',
    BOOKMARKED: '/api/videos/bookmarked',
    LIKE: (id: string) => `/api/videos/${id}/like`,
    BOOKMARK: (id: string) => `/api/videos/${id}/bookmark`,
    COMMENT: (id: string) => `/api/videos/${id}/comment`
  },
  ORDERS: {
    LIST: '/api/orders',
    CREATE: '/api/orders',
    ACCEPT: (id: string) => `/api/orders/${id}/accept`,
    RESPOND: (id: string) => `/api/orders/${id}/respond`
  },
  CHATS: {
    LIST: '/api/chats/list',
    CREATE: '/api/chats/create-with-user',
    MESSAGES: (id: string) => `/api/chats/${id}/messages`
  }
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  CHAT: '/chat',
  ORDERS: '/orders',
  USER_ORDERS: '/user/orders',
  MASTER_ORDERS: '/master/orders',
  CREATE_ORDER: '/orders/create',
  CREATE_VIDEO: '/create-video-ad',
  ADMIN_DASHBOARD: '/admin/dashboard'
} as const

// Kazakhstan Regions
export const KAZAKHSTAN_REGIONS = [
  'Алматинская область',
  'Акмолинская область', 
  'Актюбинская область',
  'Атырауская область',
  'Восточно-Казахстанская область',
  'Жамбылская область',
  'Западно-Казахстанская область',
  'Карагандинская область',
  'Костанайская область',
  'Кызылординская область',
  'Мангистауская область',
  'Павлодарская область',
  'Северо-Казахстанская область',
  'Туркестанская область',
  'Алматы',
  'Астана',
  'Шымкент'
] as const

// Video Categories
export const VIDEO_CATEGORIES = [
  'Мебель',
  'Кухня',
  'Спальня',
  'Гостиная',
  'Детская',
  'Офис',
  'Сад',
  'Другое'
] as const

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  PAGINATION_LIMIT: 20,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
} as const

// Socket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  VIDEO_LIKED: 'video_liked',
  VIDEO_COMMENTED: 'video_commented',
  ORDER_CREATED: 'order_created',
  ORDER_RESPONDED: 'order_responded',
  ORDER_ACCEPTED: 'order_accepted',
  MESSAGE_SENT: 'message_sent',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline'
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'mebelplace_auth_token',
  REFRESH_TOKEN: 'mebelplace_refresh_token',
  USER_DATA: 'mebelplace_user_data',
  THEME: 'mebelplace_theme',
  LANGUAGE: 'mebelplace_language'
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  UNAUTHORIZED: 'Необходимо войти в систему.',
  FORBIDDEN: 'У вас нет прав для выполнения этого действия.',
  NOT_FOUND: 'Запрашиваемый ресурс не найден.',
  VALIDATION_ERROR: 'Ошибка валидации данных.',
  SERVER_ERROR: 'Внутренняя ошибка сервера.',
  FILE_TOO_LARGE: 'Файл слишком большой.',
  INVALID_FILE_TYPE: 'Неподдерживаемый тип файла.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Успешный вход в систему.',
  REGISTER_SUCCESS: 'Регистрация прошла успешно.',
  ORDER_CREATED: 'Заявка создана успешно.',
  ORDER_RESPONDED: 'Отклик отправлен.',
  ORDER_ACCEPTED: 'Заявка принята.',
  VIDEO_UPLOADED: 'Видео загружено успешно.',
  PROFILE_UPDATED: 'Профиль обновлен.',
  MESSAGE_SENT: 'Сообщение отправлено.'
} as const
