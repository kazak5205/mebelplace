'use client';

import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
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
  FlagPlus,
  FlagMinus,
  TargetPlus,
  TargetMinus,
  ZapPlus,
  ZapMinus,
  ShieldPlus,
  ShieldMinus,
  KeyPlus,
  KeyMinus,
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
  ShoppingCart,
  BarChart
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string | number;
  color?: string;
  disabled?: boolean;
  external?: boolean;
  children?: NavigationItem[];
  onClick?: () => void;
}

export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface NavigationState {
  activeItem: string | null;
  expandedItems: Set<string>;
  collapsedSections: Set<string>;
  searchQuery: string;
  filteredItems: NavigationItem[];
}

export interface GlassNavigationProps {
  children?: React.ReactNode;
  items?: NavigationItem[];
  sections?: NavigationSection[];
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'sidebar' | 'topbar';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'vertical' | 'horizontal' | 'grid' | 'inline';
  showHeader?: boolean;
  showFooter?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  showSearch?: boolean;
  showBreadcrumbs?: boolean;
  showBadges?: boolean;
  showTooltips?: boolean;
  allowSearch?: boolean;
  allowCollapse?: boolean;
  allowExpand?: boolean;
  allowBreadcrumbs?: boolean;
  allowTooltips?: boolean;
  isCollapsed?: boolean;
  isExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  title?: string;
  description?: string;
  logo?: React.ReactNode;
  searchPlaceholder?: string;
  onItemClick?: (item: NavigationItem) => void;
  onSectionToggle?: (sectionId: string, collapsed: boolean) => void;
  onSearch?: (query: string) => void;
  onCollapse?: (collapsed: boolean) => void;
  onExpand?: (expanded: boolean) => void;
}

// Navigation Context
interface NavigationContextType {
  navigationState: NavigationState;
  setActiveItem: (itemId: string | null) => void;
  toggleExpanded: (itemId: string) => void;
  toggleSection: (sectionId: string) => void;
  setSearchQuery: (query: string) => void;
  onItemClick: (item: NavigationItem) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationContext must be used within a GlassNavigation');
  }
  return context;
};

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-2',
    headerPadding: 'p-2 pb-1',
    footerPadding: 'p-2 pt-1',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs',
    itemSpacing: 'space-y-1',
    sectionSpacing: 'space-y-2',
    itemPadding: 'px-2 py-1',
    itemTextSize: 'text-xs',
    iconSize: 'w-4 h-4'
  },
  md: {
    padding: 'p-4',
    headerPadding: 'p-4 pb-2',
    footerPadding: 'p-4 pt-2',
    titleSize: 'text-base',
    descriptionSize: 'text-sm',
    itemSpacing: 'space-y-2',
    sectionSpacing: 'space-y-4',
    itemPadding: 'px-3 py-2',
    itemTextSize: 'text-sm',
    iconSize: 'w-5 h-5'
  },
  lg: {
    padding: 'p-6',
    headerPadding: 'p-6 pb-4',
    footerPadding: 'p-6 pt-4',
    titleSize: 'text-lg',
    descriptionSize: 'text-base',
    itemSpacing: 'space-y-3',
    sectionSpacing: 'space-y-6',
    itemPadding: 'px-4 py-3',
    itemTextSize: 'text-base',
    iconSize: 'w-6 h-6'
  },
  xl: {
    padding: 'p-8',
    headerPadding: 'p-8 pb-6',
    footerPadding: 'p-8 pt-6',
    titleSize: 'text-xl',
    descriptionSize: 'text-lg',
    itemSpacing: 'space-y-4',
    sectionSpacing: 'space-y-8',
    itemPadding: 'px-5 py-4',
    itemTextSize: 'text-lg',
    iconSize: 'w-7 h-7'
  }
};

// Animation variants
const navigationVariants = {
  initial: { 
    opacity: 0, 
    y: 20
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

const itemVariants = {
  initial: { 
    opacity: 0, 
    x: -20
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const submenuVariants = {
  initial: { 
    opacity: 0, 
    height: 0
  },
  animate: { 
    opacity: 1, 
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassNavigation: React.FC<GlassNavigationProps> = ({
  children,
  items = [],
  sections = [],
  variant = 'default',
  size = 'md',
  layout = 'vertical',
  showHeader = true,
  showFooter = true,
  showTitle = true,
  showDescription = true,
  showIcon = true,
  showSearch = false,
  showBreadcrumbs = false,
  showBadges = true,
  showTooltips = false,
  allowSearch = false,
  allowCollapse = false,
  allowExpand = false,
  allowBreadcrumbs = false,
  allowTooltips = false,
  isCollapsed = false,
  isExpanded = false,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  title,
  description,
  logo,
  searchPlaceholder = 'Поиск...',
  onItemClick,
  onSectionToggle,
  onSearch,
  onCollapse,
  onExpand
}) => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    activeItem: null,
    expandedItems: new Set(),
    collapsedSections: new Set(),
    searchQuery: '',
    filteredItems: items
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const config = sizeConfig[size];

  // Filter items based on search query
  const filterItems = useCallback((query: string) => {
    if (!query) {
      setNavigationState(prev => ({
        ...prev,
        filteredItems: items
      }));
      return;
    }

    const filtered = items.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    );

    setNavigationState(prev => ({
      ...prev,
      filteredItems: filtered
    }));
  }, [items]);

  // Handle search
  const handleSearch = (query: string) => {
    setNavigationState(prev => ({
      ...prev,
      searchQuery: query
    }));
    filterItems(query);
    onSearch?.(query);
  };

  // Handle item click
  const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) return;

    setNavigationState(prev => ({
      ...prev,
      activeItem: item.id
    }));

    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    }

    onItemClick?.(item);
    item.onClick?.();
  };

  // Toggle expanded state
  const toggleExpanded = (itemId: string) => {
    setNavigationState(prev => {
      const newExpanded = new Set(prev.expandedItems);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return {
        ...prev,
        expandedItems: newExpanded
      };
    });
  };

  // Toggle section
  const toggleSection = (sectionId: string) => {
    setNavigationState(prev => {
      const newCollapsed = new Set(prev.collapsedSections);
      if (newCollapsed.has(sectionId)) {
        newCollapsed.delete(sectionId);
      } else {
        newCollapsed.add(sectionId);
      }
      return {
        ...prev,
        collapsedSections: newCollapsed
      };
    });

    const isCollapsed = navigationState.collapsedSections.has(sectionId);
    onSectionToggle?.(sectionId, !isCollapsed);
  };

  // Set active item
  const setActiveItem = (itemId: string | null) => {
    setNavigationState(prev => ({
      ...prev,
      activeItem: itemId
    }));
  };

  // Set search query
  const setSearchQuery = (query: string) => {
    handleSearch(query);
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className={cn(
        'flex items-center justify-between border-b border-glass-border/50',
        config.headerPadding,
        headerClassName
      )}>
        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          {logo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}
          {showTitle && title && (
            <div>
              <h2 className={cn(
                'font-semibold text-white',
                config.titleSize
              )}>
                {title}
              </h2>
              {showDescription && description && (
                <p className={cn(
                  'text-white/80',
                  config.descriptionSize
                )}>
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Search and actions */}
        <div className="flex items-center space-x-2">
          {/* Search button */}
          {allowSearch && showSearch && (
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200 md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  };

  // Render search
  const renderSearch = () => {
    if (!allowSearch || !showSearch || !isSearchOpen) return null;

    return (
      <motion.div
        className="p-4 border-b border-glass-border/50"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            ref={searchRef}
            type="text"
            placeholder={searchPlaceholder}
            value={navigationState.searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-sm"
          />
        </div>
      </motion.div>
    );
  };

  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    if (!allowBreadcrumbs || !showBreadcrumbs) return null;

    return (
      <div className="p-4 border-b border-glass-border/50">
        <nav className="flex items-center space-x-2 text-sm">
          <Home className="w-4 h-4 text-white/60" />
          <ChevronRight className="w-4 h-4 text-white/40" />
          <span className="text-white/80">Главная</span>
          <ChevronRight className="w-4 h-4 text-white/40" />
          <span className="text-white/60">Текущая страница</span>
        </nav>
      </div>
    );
  };

  // Render item
  const renderItem = (item: NavigationItem, level: number = 0) => {
    const isActive = navigationState.activeItem === item.id;
    const isExpanded = navigationState.expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <motion.div
        key={item.id}
        className="space-y-1"
        variants={itemVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Main item */}
        <div
          className={cn(
            'flex items-center space-x-3 cursor-pointer transition-colors duration-200 rounded-lg',
            config.itemPadding,
            config.itemTextSize,
            isActive && 'bg-orange-500/20 text-orange-300',
            !isActive && 'text-white/80 hover:bg-glass-secondary/30',
            item.disabled && 'opacity-50 cursor-not-allowed',
            level > 0 && 'ml-4'
          )}
          onClick={() => handleItemClick(item)}
        >
          {/* Item icon */}
          {item.icon && showIcon && (
            <item.icon className={cn(
              config.iconSize,
              isActive ? 'text-orange-400' : 'text-white/60'
            )} />
          )}

          {/* Item content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="truncate">{item.label}</span>
              {item.badge && showBadges && (
                <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-white/60 truncate">{item.description}</p>
            )}
          </div>

          {/* External link icon */}
          {item.external && (
            <ExternalLink className="w-4 h-4 text-white/40" />
          )}

          {/* Expand/collapse icon */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(item.id);
              }}
              className="p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Submenu */}
        {hasChildren && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="space-y-1"
                variants={submenuVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {item.children?.map(child => renderItem(child, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    );
  };

  // Render section
  const renderSection = (section: NavigationSection) => {
    const isCollapsed = navigationState.collapsedSections.has(section.id);

    return (
      <motion.div
        key={section.id}
        className={cn(
          'space-y-2',
          config.sectionSpacing
        )}
        variants={itemVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Section header */}
        {section.title && (
          <div className="flex items-center justify-between">
            <h3 className={cn(
              'font-medium text-white/60 uppercase tracking-wide',
              config.itemTextSize
            )}>
              {section.title}
            </h3>

            {/* Collapse button */}
            {section.collapsible && (
              <button
                onClick={() => toggleSection(section.id)}
                className="p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Section items */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className={cn(
                'space-y-1',
                config.itemSpacing
              )}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {section.items.map(item => renderItem(item))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!showFooter) return null;

    return (
      <div className={cn(
        'flex items-center justify-between border-t border-glass-border/50',
        config.footerPadding,
        footerClassName
      )}>
        <div className="text-xs text-white/60">
          © 2024 MebelPlace
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Get size classes
  const getSizeClasses = () => {
    if (variant === 'sidebar') {
      return 'w-64 h-full';
    }
    if (variant === 'topbar') {
      return 'w-full h-16';
    }
    return 'w-full';
  };

  // Get layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-row space-x-4';
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'inline':
        return 'flex flex-wrap gap-2';
      default:
        return 'flex flex-col';
    }
  };

  // Navigation context value
  const navigationContextValue: NavigationContextType = {
    navigationState,
    setActiveItem,
    toggleExpanded,
    toggleSection,
    setSearchQuery,
    onItemClick: handleItemClick
  };

  return (
    <NavigationContext.Provider value={navigationContextValue}>
      <motion.nav
        ref={navigationRef}
        className={cn(
          'bg-glass-primary/90 backdrop-blur-xl',
          'border border-glass-border/50',
          'rounded-2xl shadow-glass-lg',
          'overflow-hidden',
          'flex flex-col',
          getSizeClasses(),
          className
        )}
        variants={navigationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        {renderHeader()}

        {/* Search */}
        {renderSearch()}

        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Body */}
        <div className={cn(
          'flex-1 overflow-auto',
          config.padding,
          bodyClassName
        )}>
          <div className={cn(
            config.itemSpacing,
            getLayoutClasses()
          )}>
            {/* Direct items */}
            {navigationState.filteredItems.map(item => renderItem(item))}

            {/* Sections */}
            {sections.map(renderSection)}

            {/* Custom children */}
            {children}
          </div>
        </div>

        {/* Footer */}
        {renderFooter()}

        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
      </motion.nav>
    </NavigationContext.Provider>
  );
};

// Convenience components
export const GlassNavigationCompact: React.FC<Omit<GlassNavigationProps, 'variant' | 'size'>> = (props) => (
  <GlassNavigation {...props} variant="compact" size="sm" />
);

export const GlassNavigationDetailed: React.FC<Omit<GlassNavigationProps, 'variant' | 'size'>> = (props) => (
  <GlassNavigation {...props} variant="detailed" size="lg" />
);

export const GlassNavigationMinimal: React.FC<Omit<GlassNavigationProps, 'variant'>> = (props) => (
  <GlassNavigation {...props} variant="minimal" showHeader={false} showFooter={false} showTitle={false} showDescription={false} />
);

export const GlassNavigationSidebar: React.FC<Omit<GlassNavigationProps, 'variant'>> = (props) => (
  <GlassNavigation {...props} variant="sidebar" layout="vertical" />
);

export const GlassNavigationTopbar: React.FC<Omit<GlassNavigationProps, 'variant'>> = (props) => (
  <GlassNavigation {...props} variant="topbar" layout="horizontal" />
);

// Example usage component
export const GlassNavigationExample: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const sampleItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Главная',
      href: '/',
      icon: Home,
      description: 'Перейти на главную страницу'
    },
    {
      id: 'catalog',
      label: 'Каталог',
      href: '/catalog',
      icon: FileText,
      description: 'Просмотр каталога товаров',
      badge: '12'
    },
    {
      id: 'orders',
      label: 'Заказы',
      href: '/orders',
      icon: ShoppingCart,
      description: 'Управление заказами',
      badge: 3
    },
    {
      id: 'profile',
      label: 'Профиль',
      href: '/profile',
      icon: User,
      description: 'Личный кабинет'
    },
    {
      id: 'settings',
      label: 'Настройки',
      href: '/settings',
      icon: Settings,
      description: 'Настройки системы'
    }
  ];

  const sampleSections: NavigationSection[] = [
    {
      id: 'main',
      title: 'Основное',
      items: [
        {
          id: 'dashboard',
          label: 'Панель управления',
          href: '/dashboard',
          icon: Target,
          description: 'Обзор системы'
        },
        {
          id: 'analytics',
          label: 'Аналитика',
          href: '/analytics',
          icon: BarChart,
          description: 'Статистика и отчеты'
        }
      ],
      collapsible: true
    },
    {
      id: 'tools',
      title: 'Инструменты',
      items: [
        {
          id: 'search',
          label: 'Поиск',
          href: '/search',
          icon: Search,
          description: 'Поиск по системе'
        },
        {
          id: 'filters',
          label: 'Фильтры',
          href: '/filters',
          icon: Filter,
          description: 'Настройка фильтров'
        }
      ],
      collapsible: true,
      collapsed: true
    }
  ];

  const handleItemClick = (item: NavigationItem) => {
    setActiveItem(item.id);
    console.log('Navigation item clicked:', item);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Navigation examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Навигация</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычная навигация
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактная навигация
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальная навигация
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальная навигация
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Боковая панель
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Верхняя панель
          </button>
        </div>
      </div>

      {/* Default navigation */}
      <GlassNavigation
        title="Навигация"
        description="Основная навигация по сайту"
        items={sampleItems}
        sections={sampleSections}
        variant="default"
        size="md"
        layout="vertical"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showSearch
        showBreadcrumbs
        showBadges
        allowSearch
        allowCollapse
        allowExpand
        allowBreadcrumbs
        onItemClick={handleItemClick}
        onSectionToggle={(sectionId, collapsed) => console.log('Section toggled:', sectionId, collapsed)}
        onSearch={(query) => console.log('Search:', query)}
      />

      {/* Compact navigation */}
      <GlassNavigationCompact
        title="Быстрая навигация"
        items={sampleItems.slice(0, 3)}
        showHeader
        showTitle
        showIcon
        showBadges
        onItemClick={handleItemClick}
      />

      {/* Detailed navigation */}
      <GlassNavigationDetailed
        title="Детальная навигация"
        description="Подробная навигация с множеством возможностей"
        items={sampleItems}
        sections={sampleSections}
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showSearch
        showBreadcrumbs
        showBadges
        allowSearch
        allowCollapse
        allowExpand
        allowBreadcrumbs
        onItemClick={handleItemClick}
      />

      {/* Minimal navigation */}
      <GlassNavigationMinimal
        items={sampleItems.slice(0, 4)}
        showIcon
        showBadges
        onItemClick={handleItemClick}
      />

      {/* Sidebar navigation */}
      <div className="flex space-x-4">
        <GlassNavigationSidebar
          title="Боковая панель"
          items={sampleItems}
          sections={sampleSections}
          showHeader
          showFooter
          showTitle
          showIcon
          showBadges
          allowCollapse
          allowExpand
          onItemClick={handleItemClick}
        />
        <div className="flex-1 p-4 bg-glass-primary/50 rounded-lg">
          <h4 className="text-white mb-2">Основной контент</h4>
          <p className="text-white/60">Здесь находится основной контент страницы</p>
        </div>
      </div>

      {/* Topbar navigation */}
      <GlassNavigationTopbar
        title="Верхняя панель"
        items={sampleItems.slice(0, 5)}
        showHeader
        showTitle
        showIcon
        showBadges
        onItemClick={handleItemClick}
      />
    </div>
  );
};