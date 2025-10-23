// Unified routing configuration для web и mobile

export interface RouteConfig {
  path: string;
  name: string;
  requireAuth: boolean;
  allowedRoles?: ('client' | 'master' | 'admin')[];
  icon?: string;
  showInNav?: boolean;
}

// ============================================
// WEB ROUTES (React Router)
// ============================================
export const webRoutes: Record<string, RouteConfig> = {
  // Public routes
  HOME: {
    path: '/',
    name: 'Главная',
    requireAuth: false,
    showInNav: true,
    icon: 'Home',
  },
  SEARCH: {
    path: '/search',
    name: 'Поиск',
    requireAuth: false,
    showInNav: true,
    icon: 'Search',
  },
  LOGIN: {
    path: '/login',
    name: 'Вход',
    requireAuth: false,
  },
  REGISTER: {
    path: '/register',
    name: 'Регистрация',
    requireAuth: false,
  },
  
  // Protected routes
  PROFILE: {
    path: '/profile',
    name: 'Профиль',
    requireAuth: true,
    showInNav: true,
    icon: 'User',
  },
  MASTER_CHANNEL: {
    path: '/master/:id',
    name: 'Канал мастера',
    requireAuth: false,
  },
  MASTER_ME: {
    path: '/master/me',
    name: 'Мой канал',
    requireAuth: true,
    allowedRoles: ['master', 'admin'],
    showInNav: true,
    icon: 'Video',
  },
  
  // Orders
  ORDERS: {
    path: '/orders',
    name: 'Заявки',
    requireAuth: true,
    showInNav: true,
    icon: 'FileText',
  },
  CREATE_ORDER: {
    path: '/orders/create',
    name: 'Создать заявку',
    requireAuth: true,
    allowedRoles: ['client', 'admin'],
  },
  ORDER_RESPONSES: {
    path: '/orders/:id/responses',
    name: 'Отклики на заявку',
    requireAuth: true,
  },
  ORDER_RESPOND: {
    path: '/orders/:id/respond',
    name: 'Откликнуться',
    requireAuth: true,
    allowedRoles: ['master', 'admin'],
  },
  
  // Chat
  CHATS: {
    path: '/chat',
    name: 'Сообщения',
    requireAuth: true,
    showInNav: true,
    icon: 'MessageCircle',
  },
  CHAT: {
    path: '/chat/:id',
    name: 'Чат',
    requireAuth: true,
  },
  
  // Admin
  ADMIN: {
    path: '/admin',
    name: 'Админ-панель',
    requireAuth: true,
    allowedRoles: ['admin'],
    showInNav: true,
    icon: 'Shield',
  },
  ADMIN_USERS: {
    path: '/admin/users',
    name: 'Пользователи',
    requireAuth: true,
    allowedRoles: ['admin'],
  },
  ADMIN_VIDEOS: {
    path: '/admin/videos',
    name: 'Видео',
    requireAuth: true,
    allowedRoles: ['admin'],
  },
  ADMIN_ORDERS: {
    path: '/admin/orders',
    name: 'Заявки',
    requireAuth: true,
    allowedRoles: ['admin'],
  },
  ADMIN_ANALYTICS: {
    path: '/admin/analytics',
    name: 'Аналитика',
    requireAuth: true,
    allowedRoles: ['admin'],
  },
  
  // Legal
  PRIVACY: {
    path: '/privacy',
    name: 'Политика конфиденциальности',
    requireAuth: false,
  },
  TERMS: {
    path: '/terms',
    name: 'Условия использования',
    requireAuth: false,
  },
};

// ============================================
// MOBILE ROUTES (React Navigation)
// ============================================
export const mobileRoutes = {
  // Auth Stack
  AUTH: {
    LOGIN: 'Login',
    REGISTER: 'Register',
  },
  
  // Main Tabs
  TABS: {
    VIDEO: 'Видео',
    SEARCH: 'Поиск',
    ORDERS: 'Заявки',
    CHAT: 'Чат',
    PROFILE: 'Профиль',
  },
  
  // Video Stack
  VIDEO: {
    TIKTOK_PLAYER: 'TikTokPlayer',
    CAMERA: 'Camera',
    MEDIA_SELECTION: 'MediaSelection',
  },
  
  // Search Stack
  SEARCH: {
    LIST: 'SearchList',
    MASTER_CHANNEL: 'MasterChannel',
  },
  
  // Order Stack
  ORDER: {
    LIST: 'OrdersList',
    DETAILS: 'OrderDetails',
    CREATE: 'CreateOrder',
    RESPOND: 'OrderRespond',
  },
  
  // Message Stack
  MESSAGE: {
    LIST: 'MessagesList',
    CHAT: 'Chat',
  },
};

// ============================================
// REDIRECT RULES
// ============================================
export const getRedirectPath = (role: 'client' | 'master' | 'admin'): string => {
  const redirects = {
    client: '/',
    master: '/master/me',
    admin: '/admin',
  };
  return redirects[role];
};

export const getMobileInitialRoute = (role: 'client' | 'master' | 'admin'): string => {
  const redirects = {
    client: mobileRoutes.TABS.VIDEO,
    master: mobileRoutes.TABS.ORDERS,
    admin: mobileRoutes.TABS.VIDEO,
  };
  return redirects[role];
};

// ============================================
// TAB CONFIGURATION
// ============================================
export interface TabConfig {
  name: string;
  label: string;
  icon: string;
  badge?: boolean;
  roles: ('client' | 'master' | 'admin')[];
}

export const clientTabs: TabConfig[] = [
  {
    name: mobileRoutes.TABS.VIDEO,
    label: 'Видео',
    icon: 'play',
    roles: ['client'],
  },
  {
    name: mobileRoutes.TABS.SEARCH,
    label: 'Поиск',
    icon: 'search',
    roles: ['client'],
  },
  {
    name: mobileRoutes.TABS.ORDERS,
    label: 'Мои заявки',
    icon: 'file-text',
    badge: true,
    roles: ['client'],
  },
  {
    name: mobileRoutes.TABS.CHAT,
    label: 'Чат',
    icon: 'message-circle',
    badge: true,
    roles: ['client'],
  },
  {
    name: mobileRoutes.TABS.PROFILE,
    label: 'Профиль',
    icon: 'user',
    roles: ['client'],
  },
];

export const masterTabs: TabConfig[] = [
  {
    name: mobileRoutes.TABS.VIDEO,
    label: 'Видео',
    icon: 'play',
    roles: ['master'],
  },
  {
    name: mobileRoutes.TABS.SEARCH,
    label: 'Поиск',
    icon: 'search',
    roles: ['master'],
  },
  {
    name: mobileRoutes.TABS.ORDERS,
    label: 'Заявки',
    icon: 'file-text',
    badge: true,
    roles: ['master'],
  },
  {
    name: mobileRoutes.TABS.CHAT,
    label: 'Чат',
    icon: 'message-circle',
    badge: true,
    roles: ['master'],
  },
  {
    name: mobileRoutes.TABS.PROFILE,
    label: 'Профиль',
    icon: 'user',
    roles: ['master'],
  },
];

export const getTabs = (role: 'client' | 'master' | 'admin'): TabConfig[] => {
  if (role === 'master' || role === 'admin') {
    return masterTabs;
  }
  return clientTabs;
};

