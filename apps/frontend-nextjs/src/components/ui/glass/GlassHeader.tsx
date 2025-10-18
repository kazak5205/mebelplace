'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Tag,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Bookmark,
  Flag,
  Target,
  Zap,
  Shield,
  Bell,
  Heart,
  Star,
  Plus,
  Minus,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Copy,
  ExternalLink,
  RefreshCw,
  Loader,
  Download,
  Upload,
  Share2,
  Edit,
  Trash2,
  Folder,
  File,
  FolderOpen,
  FolderPlus,
  FilePlus,
  FileMinus,
  FolderMinus,
  Trash,
  BookmarkPlus,
  BookmarkMinus,
  ShieldPlus,
  ShieldMinus,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Menu,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Monitor,
  Globe,
  Languages,
  ShoppingCart,
  UserCircle,
  LogOut,
  LogIn,
  UserPlus,
  MessageCircle
} from 'lucide-react';

export interface HeaderAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface HeaderMenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
  children?: HeaderMenuItem[];
  onClick?: () => void;
}

export interface HeaderState {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isUserMenuOpen: boolean;
  isLanguageMenuOpen: boolean;
  isThemeMenuOpen: boolean;
}

export interface GlassHeaderProps {
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'transparent' | 'fixed';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLogo?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showNavigation?: boolean;
  showSearch?: boolean;
  showActions?: boolean;
  showUserMenu?: boolean;
  showLanguageMenu?: boolean;
  showThemeMenu?: boolean;
  showNotifications?: boolean;
  showMobileMenu?: boolean;
  allowSearch?: boolean;
  allowUserMenu?: boolean;
  allowLanguageMenu?: boolean;
  allowThemeMenu?: boolean;
  allowNotifications?: boolean;
  allowMobileMenu?: boolean;
  isSticky?: boolean;
  isTransparent?: boolean;
  className?: string;
  logoClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  navigationClassName?: string;
  actionsClassName?: string;
  logo?: React.ReactNode;
  title?: string;
  description?: string;
  navigation?: HeaderMenuItem[];
  actions?: HeaderAction[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  languages?: Array<{
    code: string;
    name: string;
    flag?: string;
  }>;
  currentLanguage?: string;
  currentTheme?: 'light' | 'dark' | 'system';
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>;
  unreadNotifications?: number;
  onLogoClick?: () => void;
  onTitleClick?: () => void;
  onNavigationClick?: (item: HeaderMenuItem) => void;
  onActionClick?: (action: HeaderAction) => void;
  onUserMenuClick?: () => void;
  onLanguageChange?: (language: string) => void;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  onNotificationClick?: (notification: any) => void;
  onSearch?: (query: string) => void;
  onLogin?: () => void;
  onLogout?: () => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    height: 'h-12',
    padding: 'px-4 py-2',
    logoSize: 'w-8 h-8',
    titleSize: 'text-lg',
    descriptionSize: 'text-sm',
    iconSize: 'w-4 h-4',
    buttonSize: 'px-3 py-1.5',
    textSize: 'text-sm'
  },
  md: {
    height: 'h-16',
    padding: 'px-6 py-3',
    logoSize: 'w-10 h-10',
    titleSize: 'text-xl',
    descriptionSize: 'text-base',
    iconSize: 'w-5 h-5',
    buttonSize: 'px-4 py-2',
    textSize: 'text-base'
  },
  lg: {
    height: 'h-20',
    padding: 'px-8 py-4',
    logoSize: 'w-12 h-12',
    titleSize: 'text-2xl',
    descriptionSize: 'text-lg',
    iconSize: 'w-6 h-6',
    buttonSize: 'px-5 py-3',
    textSize: 'text-lg'
  },
  xl: {
    height: 'h-24',
    padding: 'px-10 py-5',
    logoSize: 'w-14 h-14',
    titleSize: 'text-3xl',
    descriptionSize: 'text-xl',
    iconSize: 'w-7 h-7',
    buttonSize: 'px-6 py-4',
    textSize: 'text-xl'
  }
};

// Animation variants
const headerVariants = {
  initial: { 
    opacity: 0, 
    y: -20
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const menuVariants = {
  initial: { 
    opacity: 0, 
    y: -10,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassHeader: React.FC<GlassHeaderProps> = ({
  children,
  variant = 'default',
  size = 'md',
  showLogo = true,
  showTitle = true,
  showDescription = true,
  showNavigation = true,
  showSearch = false,
  showActions = true,
  showUserMenu = true,
  showLanguageMenu = false,
  showThemeMenu = false,
  showNotifications = true,
  showMobileMenu = true,
  allowSearch = false,
  allowUserMenu = false,
  allowLanguageMenu = false,
  allowThemeMenu = false,
  allowNotifications = false,
  allowMobileMenu = false,
  isSticky = false,
  isTransparent = false,
  className,
  logoClassName,
  titleClassName,
  descriptionClassName,
  navigationClassName,
  actionsClassName,
  logo,
  title,
  description,
  navigation = [],
  actions = [],
  user,
  languages = [],
  currentLanguage = 'ru',
  currentTheme = 'system',
  notifications = [],
  unreadNotifications = 0,
  onLogoClick,
  onTitleClick,
  onNavigationClick,
  onActionClick,
  onUserMenuClick,
  onLanguageChange,
  onThemeChange,
  onNotificationClick,
  onSearch,
  onLogin,
  onLogout
}) => {
  const [headerState, setHeaderState] = useState<HeaderState>({
    isScrolled: false,
    isMobileMenuOpen: false,
    isSearchOpen: false,
    isUserMenuOpen: false,
    isLanguageMenuOpen: false,
    isThemeMenuOpen: false
  });

  const [searchQuery, setSearchQuery] = useState('');

  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const config = sizeConfig[size];

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setHeaderState(prev => ({
        ...prev,
        isScrolled: scrolled
      }));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Handle navigation click
  const handleNavigationClick = (item: HeaderMenuItem) => {
    onNavigationClick?.(item);
    item.onClick?.();
  };

  // Handle action click
  const handleActionClick = (action: HeaderAction) => {
    onActionClick?.(action);
    action.onClick?.();
  };

  // Handle user menu toggle
  const handleUserMenuToggle = () => {
    setHeaderState(prev => ({
      ...prev,
      isUserMenuOpen: !prev.isUserMenuOpen
    }));
    onUserMenuClick?.();
  };

  // Handle language change
  const handleLanguageChange = (language: string) => {
    onLanguageChange?.(language);
    setHeaderState(prev => ({
      ...prev,
      isLanguageMenuOpen: false
    }));
  };

  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    onThemeChange?.(theme);
    setHeaderState(prev => ({
      ...prev,
      isThemeMenuOpen: false
    }));
  };

  // Render logo
  const renderLogo = () => {
    if (!showLogo) return null;

    return (
      <div
        className={cn(
          'flex items-center space-x-3 cursor-pointer',
          logoClassName
        )}
        onClick={onLogoClick}
      >
        {logo ? (
          logo
        ) : (
          <div className={cn(
            'bg-orange-500 rounded-lg flex items-center justify-center',
            config.logoSize
          )}>
            <span className="text-white font-bold text-lg">M</span>
          </div>
        )}
        {showTitle && title && (
          <div>
            <h1 className={cn(
              'font-bold text-white',
              config.titleSize,
              titleClassName
            )}>
              {title}
            </h1>
            {showDescription && description && (
              <p className={cn(
                'text-white/80',
                config.descriptionSize,
                descriptionClassName
              )}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render navigation
  const renderNavigation = () => {
    if (!showNavigation || navigation.length === 0) return null;

    return (
      <nav className={cn(
        'hidden md:flex items-center space-x-1',
        navigationClassName
      )}>
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigationClick(item)}
            disabled={item.disabled}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200',
              config.textSize,
              item.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'text-white/80 hover:text-white hover:bg-glass-secondary/30'
            )}
          >
            {item.icon && (
              <item.icon className={config.iconSize} />
            )}
            <span>{item.label}</span>
            {item.badge && (
              <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full">
                {item.badge}
              </span>
            )}
            {item.external && (
              <ExternalLink className="w-3 h-3 text-white/40" />
            )}
          </button>
        ))}
      </nav>
    );
  };

  // Render search
  const renderSearch = () => {
    if (!allowSearch || !showSearch) return null;

    return (
      <div className="relative">
        <button
          onClick={() => setHeaderState(prev => ({ ...prev, isSearchOpen: !prev.isSearchOpen }))}
          className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
        >
          <Search className={config.iconSize} />
        </button>

        <AnimatePresence>
          {headerState.isSearchOpen && (
            <motion.div
              className="absolute right-0 top-full mt-2 w-80 bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-lg shadow-glass-lg p-4"
              variants={menuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render actions
  const renderActions = () => {
    if (!showActions || actions.length === 0) return null;

    return (
      <div className={cn(
        'flex items-center space-x-2',
        actionsClassName
      )}>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled || action.loading}
            className={cn(
              'flex items-center space-x-2 rounded-lg transition-colors duration-200',
              config.buttonSize,
              config.textSize,
              action.variant === 'primary' && 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30',
              action.variant === 'secondary' && 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50',
              action.variant === 'danger' && 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
              action.variant === 'success' && 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
              action.variant === 'warning' && 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30',
              !action.variant && 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50',
              (action.disabled || action.loading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {action.icon && <action.icon className={config.iconSize} />}
            <span>{action.label}</span>
            {action.loading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        ))}
      </div>
    );
  };

  // Render notifications
  const renderNotifications = () => {
    if (!allowNotifications || !showNotifications) return null;

    return (
      <div className="relative">
        <button
          onClick={() => setHeaderState(prev => ({ ...prev, isUserMenuOpen: !prev.isUserMenuOpen }))}
          className="relative p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
        >
          <Bell className={config.iconSize} />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
        </button>

        <AnimatePresence>
          {headerState.isUserMenuOpen && (
            <motion.div
              className="absolute right-0 top-full mt-2 w-80 bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-lg shadow-glass-lg p-4"
              variants={menuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="space-y-2">
                <h3 className="text-white font-medium mb-2">Уведомления</h3>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => onNotificationClick?.(notification)}
                      className="p-3 bg-glass-secondary/30 rounded-lg cursor-pointer hover:bg-glass-secondary/50 transition-colors duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-2',
                          notification.type === 'info' && 'bg-blue-500',
                          notification.type === 'success' && 'bg-green-500',
                          notification.type === 'warning' && 'bg-yellow-500',
                          notification.type === 'error' && 'bg-red-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{notification.title}</p>
                          <p className="text-white/60 text-xs">{notification.message}</p>
                          <p className="text-white/40 text-xs mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/60 text-sm text-center py-4">Нет уведомлений</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render user menu
  const renderUserMenu = () => {
    if (!allowUserMenu || !showUserMenu) return null;

    return (
      <div className="relative">
        <button
          onClick={handleUserMenuToggle}
          className="flex items-center space-x-2 p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className={cn('rounded-full', config.logoSize)}
            />
          ) : (
            <div className={cn(
              'bg-orange-500 rounded-full flex items-center justify-center',
              config.logoSize
            )}>
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="text-white/60 text-xs">{user?.role}</p>
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {headerState.isUserMenuOpen && (
            <motion.div
              className="absolute right-0 top-full mt-2 w-64 bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-lg shadow-glass-lg p-4"
              variants={menuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="space-y-2">
                {user ? (
                  <>
                    <div className="p-3 bg-glass-secondary/30 rounded-lg">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/60 text-sm">{user.email}</p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center space-x-2 p-2 text-white/80 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Выйти</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onLogin}
                    className="w-full flex items-center space-x-2 p-2 text-white/80 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Войти</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render mobile menu
  const renderMobileMenu = () => {
    if (!allowMobileMenu || !showMobileMenu) return null;

    return (
      <button
        onClick={() => setHeaderState(prev => ({ ...prev, isMobileMenuOpen: !prev.isMobileMenuOpen }))}
        className="md:hidden p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
      >
        {headerState.isMobileMenuOpen ? (
          <X className={config.iconSize} />
        ) : (
          <Menu className={config.iconSize} />
        )}
      </button>
    );
  };

  // Get header classes
  const getHeaderClasses = () => {
    return cn(
      'bg-glass-primary/90 backdrop-blur-xl border-b border-glass-border/50',
      'flex items-center justify-between',
      config.height,
      config.padding,
      isSticky && 'sticky top-0 z-50',
      isTransparent && 'bg-transparent border-transparent',
      headerState.isScrolled && 'shadow-glass-lg',
      className
    );
  };

  return (
    <motion.header
      ref={headerRef}
      className={getHeaderClasses()}
      variants={headerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Left section */}
      <div className="flex items-center space-x-4">
        {renderLogo()}
        {renderNavigation()}
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-2">
        {renderSearch()}
        {renderActions()}
        {renderNotifications()}
        {renderUserMenu()}
        {renderMobileMenu()}
      </div>

      {/* Custom children */}
      {children}

      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
    </motion.header>
  );
};

// Convenience components
export const GlassHeaderCompact: React.FC<Omit<GlassHeaderProps, 'variant' | 'size'>> = (props) => (
  <GlassHeader {...props} variant="compact" size="sm" />
);

export const GlassHeaderDetailed: React.FC<Omit<GlassHeaderProps, 'variant' | 'size'>> = (props) => (
  <GlassHeader {...props} variant="detailed" size="lg" />
);

export const GlassHeaderMinimal: React.FC<Omit<GlassHeaderProps, 'variant'>> = (props) => (
  <GlassHeader {...props} variant="minimal" showDescription={false} showNavigation={false} showActions={false} />
);

export const GlassHeaderTransparent: React.FC<Omit<GlassHeaderProps, 'variant'>> = (props) => (
  <GlassHeader {...props} variant="transparent" isTransparent />
);

export const GlassHeaderFixed: React.FC<Omit<GlassHeaderProps, 'variant'>> = (props) => (
  <GlassHeader {...props} variant="fixed" isSticky />
);

// Example usage component
export const GlassHeaderExample: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [currentLanguage, setCurrentLanguage] = useState('ru');

  const sampleNavigation: HeaderMenuItem[] = [
    {
      id: 'home',
      label: 'Главная',
      href: '/',
      icon: Home
    },
    {
      id: 'catalog',
      label: 'Каталог',
      href: '/catalog',
      icon: FileText,
      badge: '12'
    },
    {
      id: 'orders',
      label: 'Заказы',
      href: '/orders',
      icon: ShoppingCart,
      badge: 3
    },
    {
      id: 'profile',
      label: 'Профиль',
      href: '/profile',
      icon: User
    }
  ];

  const sampleActions: HeaderAction[] = [
    {
      id: 'create',
      label: 'Создать',
      icon: Plus,
      variant: 'primary'
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: Settings,
      variant: 'secondary'
    }
  ];

  const sampleUser = {
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    role: 'Администратор'
  };

  const sampleLanguages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'kk', name: 'Қазақша', flag: '🇰🇿' }
  ];

  const sampleNotifications = [
    {
      id: '1',
      title: 'Новый заказ',
      message: 'Поступил новый заказ #12345',
      type: 'info' as const,
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      title: 'Заказ выполнен',
      message: 'Заказ #12344 успешно выполнен',
      type: 'success' as const,
      timestamp: new Date(Date.now() - 3600000),
      read: false
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Header examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Заголовки</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычный заголовок
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактный заголовок
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальный заголовок
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальный заголовок
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Прозрачный заголовок
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Фиксированный заголовок
          </button>
        </div>
      </div>

      {/* Default header */}
      <GlassHeader
        title="MebelPlace"
        description="Платформа для заказа мебели"
        navigation={sampleNavigation}
        actions={sampleActions}
        user={sampleUser}
        languages={sampleLanguages}
        currentLanguage={currentLanguage}
        currentTheme={currentTheme}
        notifications={sampleNotifications}
        unreadNotifications={2}
        variant="default"
        size="md"
        showLogo
        showTitle
        showDescription
        showNavigation
        showSearch
        showActions
        showUserMenu
        showLanguageMenu
        showThemeMenu
        showNotifications
        showMobileMenu
        allowSearch
        allowUserMenu
        allowLanguageMenu
        allowThemeMenu
        allowNotifications
        allowMobileMenu
        onNavigationClick={(item) => console.log('Navigation clicked:', item)}
        onActionClick={(action) => console.log('Action clicked:', action)}
        onUserMenuClick={() => console.log('User menu clicked')}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
        onThemeChange={(theme) => setCurrentTheme(theme)}
        onNotificationClick={(notification) => console.log('Notification clicked:', notification)}
        onSearch={(query) => console.log('Search:', query)}
        onLogin={() => console.log('Login clicked')}
        onLogout={() => console.log('Logout clicked')}
      />

      {/* Compact header */}
      <GlassHeaderCompact
        title="MebelPlace"
        navigation={sampleNavigation.slice(0, 3)}
        actions={sampleActions.slice(0, 1)}
        user={sampleUser}
        showLogo
        showTitle
        showNavigation
        showActions
        showUserMenu
        allowUserMenu
        onNavigationClick={(item) => console.log('Navigation clicked:', item)}
        onActionClick={(action) => console.log('Action clicked:', action)}
      />

      {/* Detailed header */}
      <GlassHeaderDetailed
        title="MebelPlace"
        description="Платформа для заказа мебели на заказ"
        navigation={sampleNavigation}
        actions={sampleActions}
        user={sampleUser}
        languages={sampleLanguages}
        currentLanguage={currentLanguage}
        currentTheme={currentTheme}
        notifications={sampleNotifications}
        unreadNotifications={2}
        showLogo
        showTitle
        showDescription
        showNavigation
        showSearch
        showActions
        showUserMenu
        showLanguageMenu
        showThemeMenu
        showNotifications
        showMobileMenu
        allowSearch
        allowUserMenu
        allowLanguageMenu
        allowThemeMenu
        allowNotifications
        allowMobileMenu
        onNavigationClick={(item) => console.log('Navigation clicked:', item)}
        onActionClick={(action) => console.log('Action clicked:', action)}
        onUserMenuClick={() => console.log('User menu clicked')}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
        onThemeChange={(theme) => setCurrentTheme(theme)}
        onNotificationClick={(notification) => console.log('Notification clicked:', notification)}
        onSearch={(query) => console.log('Search:', query)}
      />

      {/* Minimal header */}
      <GlassHeaderMinimal
        title="MebelPlace"
        user={sampleUser}
        showLogo
        showTitle
        showUserMenu
        allowUserMenu
        onUserMenuClick={() => console.log('User menu clicked')}
      />

      {/* Transparent header */}
      <GlassHeaderTransparent
        title="MebelPlace"
        navigation={sampleNavigation}
        user={sampleUser}
        showLogo
        showTitle
        showNavigation
        showUserMenu
        allowUserMenu
        onNavigationClick={(item) => console.log('Navigation clicked:', item)}
        onUserMenuClick={() => console.log('User menu clicked')}
      />

      {/* Fixed header */}
      <GlassHeaderFixed
        title="MebelPlace"
        description="Платформа для заказа мебели"
        navigation={sampleNavigation}
        actions={sampleActions}
        user={sampleUser}
        showLogo
        showTitle
        showDescription
        showNavigation
        showActions
        showUserMenu
        allowUserMenu
        onNavigationClick={(item) => console.log('Navigation clicked:', item)}
        onActionClick={(action) => console.log('Action clicked:', action)}
        onUserMenuClick={() => console.log('User menu clicked')}
      />
    </div>
  );
};
