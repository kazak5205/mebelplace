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
  MessageCircle,
  BarChart
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string | number;
  color?: string;
  disabled?: boolean;
  external?: boolean;
  children?: MenuItem[];
  onClick?: () => void;
}

export interface MenuSection {
  id: string;
  title?: string;
  items: MenuItem[];
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface MenuState {
  activeItem: string | null;
  expandedItems: Set<string>;
  collapsedSections: Set<string>;
  isOpen: boolean;
  hoveredItem: string | null;
}

export interface GlassMenuProps {
  children?: React.ReactNode;
  items?: MenuItem[];
  sections?: MenuSection[];
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'dropdown' | 'context';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  behavior?: 'default' | 'hover' | 'click' | 'context';
  showHeader?: boolean;
  showFooter?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  showBadges?: boolean;
  showTooltips?: boolean;
  allowHover?: boolean;
  allowClick?: boolean;
  allowContext?: boolean;
  allowTooltips?: boolean;
  isOpen?: boolean;
  isExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  title?: string;
  description?: string;
  logo?: React.ReactNode;
  onItemClick?: (item: MenuItem) => void;
  onSectionToggle?: (sectionId: string, collapsed: boolean) => void;
  onMenuToggle?: (isOpen: boolean) => void;
  onExpand?: (expanded: boolean) => void;
}

// Menu Context
interface MenuContextType {
  menuState: MenuState;
  setActiveItem: (itemId: string | null) => void;
  toggleExpanded: (itemId: string) => void;
  toggleSection: (sectionId: string) => void;
  setHoveredItem: (itemId: string | null) => void;
  onItemClick: (item: MenuItem) => void;
}

const MenuContext = createContext<MenuContextType | null>(null);

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within a GlassMenu');
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
    itemPadding: 'px-2 py-1.5',
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
const menuVariants = {
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
    x: -10
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
    x: -10,
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

export const GlassMenu: React.FC<GlassMenuProps> = ({
  children,
  items = [],
  sections = [],
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  behavior = 'default',
  showHeader = true,
  showFooter = true,
  showTitle = true,
  showDescription = true,
  showIcon = true,
  showBadges = true,
  showTooltips = false,
  allowHover = false,
  allowClick = false,
  allowContext = false,
  allowTooltips = false,
  isOpen = false,
  isExpanded = false,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  title,
  description,
  logo,
  onItemClick,
  onSectionToggle,
  onMenuToggle,
  onExpand
}) => {
  const [menuState, setMenuState] = useState<MenuState>({
    activeItem: null,
    expandedItems: new Set(),
    collapsedSections: new Set(),
    isOpen: isOpen,
    hoveredItem: null
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];

  // Handle item click
  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;

    setMenuState(prev => ({
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
    setMenuState(prev => {
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
    setMenuState(prev => {
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

    const isCollapsed = menuState.collapsedSections.has(sectionId);
    onSectionToggle?.(sectionId, !isCollapsed);
  };

  // Set active item
  const setActiveItem = (itemId: string | null) => {
    setMenuState(prev => ({
      ...prev,
      activeItem: itemId
    }));
  };

  // Set hovered item
  const setHoveredItem = (itemId: string | null) => {
    setMenuState(prev => ({
      ...prev,
      hoveredItem: itemId
    }));
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
    );
  };

  // Render item
  const renderItem = (item: MenuItem, level: number = 0) => {
    const isActive = menuState.activeItem === item.id;
    const isExpanded = menuState.expandedItems.has(item.id);
    const isHovered = menuState.hoveredItem === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <motion.div
        key={item.id}
        className="relative"
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
            isHovered && 'bg-glass-secondary/20',
            item.disabled && 'opacity-50 cursor-not-allowed',
            level > 0 && 'ml-4'
          )}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => allowHover && setHoveredItem(item.id)}
          onMouseLeave={() => allowHover && setHoveredItem(null)}
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
  const renderSection = (section: MenuSection) => {
    const isCollapsed = menuState.collapsedSections.has(section.id);

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

  // Get menu classes
  const getMenuClasses = () => {
    return cn(
      'bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-2xl shadow-glass-lg',
      'flex flex-col overflow-hidden',
      orientation === 'horizontal' ? 'flex-row' : 'flex-col',
      className
    );
  };

  // Menu context value
  const menuContextValue: MenuContextType = {
    menuState,
    setActiveItem,
    toggleExpanded,
    toggleSection,
    setHoveredItem,
    onItemClick: handleItemClick
  };

  return (
    <MenuContext.Provider value={menuContextValue}>
      <motion.nav
        ref={menuRef}
        className={getMenuClasses()}
        variants={menuVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        {renderHeader()}

        {/* Body */}
        <div className={cn(
          'flex-1 overflow-auto',
          config.padding,
          bodyClassName
        )}>
          <div className={cn(
            config.itemSpacing,
            orientation === 'horizontal' ? 'flex flex-row space-x-4' : 'flex flex-col'
          )}>
            {/* Direct items */}
            {items.map(item => renderItem(item))}

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
    </MenuContext.Provider>
  );
};

// Convenience components
export const GlassMenuCompact: React.FC<Omit<GlassMenuProps, 'variant' | 'size'>> = (props) => (
  <GlassMenu {...props} variant="compact" size="sm" />
);

export const GlassMenuDetailed: React.FC<Omit<GlassMenuProps, 'variant' | 'size'>> = (props) => (
  <GlassMenu {...props} variant="detailed" size="lg" />
);

export const GlassMenuMinimal: React.FC<Omit<GlassMenuProps, 'variant'>> = (props) => (
  <GlassMenu {...props} variant="minimal" showHeader={false} showFooter={false} showTitle={false} showDescription={false} />
);

export const GlassMenuDropdown: React.FC<Omit<GlassMenuProps, 'variant'>> = (props) => (
  <GlassMenu {...props} variant="dropdown" behavior="click" />
);

export const GlassMenuContext: React.FC<Omit<GlassMenuProps, 'variant'>> = (props) => (
  <GlassMenu {...props} variant="context" behavior="context" />
);

// Example usage component
export const GlassMenuExample: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const sampleItems: MenuItem[] = [
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

  const sampleSections: MenuSection[] = [
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

  const handleItemClick = (item: MenuItem) => {
    setActiveItem(item.id);
    console.log('Menu item clicked:', item);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Menu examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Меню</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычное меню
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактное меню
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальное меню
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальное меню
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Выпадающее меню
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Контекстное меню
          </button>
        </div>
      </div>

      {/* Default menu */}
      <GlassMenu
        title="Меню"
        description="Основное меню навигации"
        items={sampleItems}
        sections={sampleSections}
        variant="default"
        size="md"
        orientation="horizontal"
        behavior="default"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showBadges
        allowHover
        allowClick
        onItemClick={handleItemClick}
        onSectionToggle={(sectionId, collapsed) => console.log('Section toggled:', sectionId, collapsed)}
        onMenuToggle={(isOpen) => console.log('Menu toggled:', isOpen)}
      />

      {/* Compact menu */}
      <GlassMenuCompact
        title="Быстрое меню"
        items={sampleItems.slice(0, 3)}
        showHeader
        showTitle
        showIcon
        showBadges
        onItemClick={handleItemClick}
      />

      {/* Detailed menu */}
      <GlassMenuDetailed
        title="Детальное меню"
        description="Подробное меню с множеством возможностей"
        items={sampleItems}
        sections={sampleSections}
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showBadges
        allowHover
        allowClick
        onItemClick={handleItemClick}
        onSectionToggle={(sectionId, collapsed) => console.log('Section toggled:', sectionId, collapsed)}
      />

      {/* Minimal menu */}
      <GlassMenuMinimal
        items={sampleItems.slice(0, 4)}
        showIcon
        showBadges
        onItemClick={handleItemClick}
      />

      {/* Dropdown menu */}
      <GlassMenuDropdown
        title="Выпадающее меню"
        items={sampleItems}
        sections={sampleSections}
        showHeader
        showTitle
        showIcon
        showBadges
        onItemClick={handleItemClick}
      />

      {/* Context menu */}
      <GlassMenuContext
        title="Контекстное меню"
        items={sampleItems}
        sections={sampleSections}
        showHeader
        showTitle
        showIcon
        showBadges
        onItemClick={handleItemClick}
      />
    </div>
  );
};
