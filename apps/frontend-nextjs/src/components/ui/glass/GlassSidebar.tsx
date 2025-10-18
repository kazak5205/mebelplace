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
  XMark,
  Bars3,
  ChevronDown,
  ChevronUp,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Home as HomeIcon,
  User as UserIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Tag as TagIcon,
  FileText as FileTextIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  Archive as ArchiveIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon,
  Target as TargetIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Bell as BellIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Settings as SettingsIcon,
  MoreHorizontal as MoreIcon,
  Copy as CopyIcon,
  ExternalLink as ExternalLinkIcon,
  RefreshCw as RefreshIcon,
  Loader as LoaderIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Share2 as ShareIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Folder as FolderIcon,
  File as FileIcon,
  FolderOpen as FolderOpenIcon,
  FolderPlus as FolderPlusIcon,
  FilePlus as FilePlusIcon,
  FileMinus as FileMinusIcon,
  FolderMinus as FolderMinusIcon,
  Trash as TrashIcon2,
  BookmarkPlus as BookmarkPlusIcon,
  BookmarkMinus as BookmarkMinusIcon,
  FlagPlus as FlagPlusIcon,
  FlagMinus as FlagMinusIcon,
  TargetPlus as TargetPlusIcon,
  TargetMinus as TargetMinusIcon,
  ZapPlus as ZapPlusIcon,
  ZapMinus as ZapMinusIcon,
  ShieldPlus as ShieldPlusIcon,
  ShieldMinus as ShieldMinusIcon,
  KeyPlus as KeyPlusIcon,
  KeyMinus as KeyMinusIcon,
  Check as CheckIcon,
  X as XIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  HelpCircle as HelpCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Lightbulb as LightbulbIcon,
  BookOpen as BookOpenIcon,
  Menu as MenuIcon,
  XMark as XMarkIcon,
  Bars3 as Bars3Icon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
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
  Bell as BellIcon2,
  MessageCircle,
  HelpCircle as HelpCircleIcon2,
  Info as InfoIcon2,
  Star as StarIcon2,
  Heart as HeartIcon2,
  Bookmark as BookmarkIcon2,
  Share as ShareIcon2,
  Download as DownloadIcon2,
  Upload as UploadIcon2,
  Edit as EditIcon2,
  Trash as TrashIcon3,
  Plus as PlusIcon2,
  Minus as MinusIcon2,
  Check as CheckIcon2,
  X as XIcon2,
  AlertCircle as AlertCircleIcon2,
  CheckCircle as CheckCircleIcon2,
  Info as InfoIcon3,
  HelpCircle as HelpCircleIcon3,
  AlertTriangle as AlertTriangleIcon2,
  Lightbulb as LightbulbIcon2,
  BookOpen as BookOpenIcon2
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string | number;
  color?: string;
  disabled?: boolean;
  external?: boolean;
  children?: SidebarItem[];
  onClick?: () => void;
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface SidebarState {
  isCollapsed: boolean;
  activeItem: string | null;
  expandedItems: Set<string>;
  collapsedSections: Set<string>;
  searchQuery: string;
  filteredItems: SidebarItem[];
}

export interface GlassSidebarProps {
  children?: React.ReactNode;
  items?: SidebarItem[];
  sections?: SidebarSection[];
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'floating' | 'overlay';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'left' | 'right';
  behavior?: 'fixed' | 'sticky' | 'static' | 'overlay';
  showHeader?: boolean;
  showFooter?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  showSearch?: boolean;
  showToggle?: boolean;
  showBadges?: boolean;
  showTooltips?: boolean;
  allowSearch?: boolean;
  allowCollapse?: boolean;
  allowExpand?: boolean;
  allowToggle?: boolean;
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
  toggleText?: string;
  onItemClick?: (item: SidebarItem) => void;
  onSectionToggle?: (sectionId: string, collapsed: boolean) => void;
  onSearch?: (query: string) => void;
  onToggle?: (collapsed: boolean) => void;
  onExpand?: (expanded: boolean) => void;
}

// Sidebar Context
interface SidebarContextType {
  sidebarState: SidebarState;
  setActiveItem: (itemId: string | null) => void;
  toggleExpanded: (itemId: string) => void;
  toggleSection: (sectionId: string) => void;
  setSearchQuery: (query: string) => void;
  onItemClick: (item: SidebarItem) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a GlassSidebar');
  }
  return context;
};

// Size configurations
const sizeConfig = {
  sm: {
    width: 'w-48',
    collapsedWidth: 'w-12',
    padding: 'p-3',
    headerPadding: 'p-3 pb-2',
    footerPadding: 'p-3 pt-2',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs',
    itemSpacing: 'space-y-1',
    sectionSpacing: 'space-y-2',
    itemPadding: 'px-2 py-1.5',
    itemTextSize: 'text-xs',
    iconSize: 'w-4 h-4'
  },
  md: {
    width: 'w-64',
    collapsedWidth: 'w-16',
    padding: 'p-4',
    headerPadding: 'p-4 pb-3',
    footerPadding: 'p-4 pt-3',
    titleSize: 'text-base',
    descriptionSize: 'text-sm',
    itemSpacing: 'space-y-2',
    sectionSpacing: 'space-y-4',
    itemPadding: 'px-3 py-2',
    itemTextSize: 'text-sm',
    iconSize: 'w-5 h-5'
  },
  lg: {
    width: 'w-80',
    collapsedWidth: 'w-20',
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
    width: 'w-96',
    collapsedWidth: 'w-24',
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
const sidebarVariants = {
  initial: { 
    opacity: 0, 
    x: -20
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    x: -20,
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

export const GlassSidebar: React.FC<GlassSidebarProps> = ({
  children,
  items = [],
  sections = [],
  variant = 'default',
  size = 'md',
  position = 'left',
  behavior = 'fixed',
  showHeader = true,
  showFooter = true,
  showTitle = true,
  showDescription = true,
  showIcon = true,
  showSearch = false,
  showToggle = true,
  showBadges = true,
  showTooltips = false,
  allowSearch = false,
  allowCollapse = false,
  allowExpand = false,
  allowToggle = false,
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
  toggleText = 'Свернуть',
  onItemClick,
  onSectionToggle,
  onSearch,
  onToggle,
  onExpand
}) => {
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isCollapsed: isCollapsed,
    activeItem: null,
    expandedItems: new Set(),
    collapsedSections: new Set(),
    searchQuery: '',
    filteredItems: items
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const config = sizeConfig[size];

  // Filter items based on search query
  const filterItems = useCallback((query: string) => {
    if (!query) {
      setSidebarState(prev => ({
        ...prev,
        filteredItems: items
      }));
      return;
    }

    const filtered = items.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    );

    setSidebarState(prev => ({
      ...prev,
      filteredItems: filtered
    }));
  }, [items]);

  // Handle search
  const handleSearch = (query: string) => {
    setSidebarState(prev => ({
      ...prev,
      searchQuery: query
    }));
    filterItems(query);
    onSearch?.(query);
  };

  // Handle item click
  const handleItemClick = (item: SidebarItem) => {
    if (item.disabled) return;

    setSidebarState(prev => ({
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
    setSidebarState(prev => {
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
    setSidebarState(prev => {
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

    const isCollapsed = sidebarState.collapsedSections.has(sectionId);
    onSectionToggle?.(sectionId, !isCollapsed);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarState(prev => ({
      ...prev,
      isCollapsed: !prev.isCollapsed
    }));
    onToggle?.(!sidebarState.isCollapsed);
  };

  // Set active item
  const setActiveItem = (itemId: string | null) => {
    setSidebarState(prev => ({
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
        {!sidebarState.isCollapsed && (
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
        )}

        {/* Toggle button */}
        {allowToggle && showToggle && (
          <button
            onClick={toggleSidebar}
            className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
            title={sidebarState.isCollapsed ? 'Развернуть' : toggleText}
          >
            {sidebarState.isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    );
  };

  // Render search
  const renderSearch = () => {
    if (!allowSearch || !showSearch || sidebarState.isCollapsed) return null;

    return (
      <div className="p-4 border-b border-glass-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            ref={searchRef}
            type="text"
            placeholder={searchPlaceholder}
            value={sidebarState.searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-sm"
          />
        </div>
      </div>
    );
  };

  // Render item
  const renderItem = (item: SidebarItem, level: number = 0) => {
    const isActive = sidebarState.activeItem === item.id;
    const isExpanded = sidebarState.expandedItems.has(item.id);
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
            level > 0 && 'ml-4',
            sidebarState.isCollapsed && 'justify-center'
          )}
          onClick={() => handleItemClick(item)}
          title={sidebarState.isCollapsed && allowTooltips ? item.label : undefined}
        >
          {/* Item icon */}
          {item.icon && showIcon && (
            <item.icon className={cn(
              config.iconSize,
              isActive ? 'text-orange-400' : 'text-white/60'
            )} />
          )}

          {/* Item content */}
          {!sidebarState.isCollapsed && (
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
          )}

          {/* External link icon */}
          {item.external && !sidebarState.isCollapsed && (
            <ExternalLink className="w-4 h-4 text-white/40" />
          )}

          {/* Expand/collapse icon */}
          {hasChildren && !sidebarState.isCollapsed && (
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
        {hasChildren && !sidebarState.isCollapsed && (
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
  const renderSection = (section: SidebarSection) => {
    const isCollapsed = sidebarState.collapsedSections.has(section.id);

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
        {section.title && !sidebarState.isCollapsed && (
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
        {!sidebarState.isCollapsed && (
          <div className="text-xs text-white/60">
            © 2024 MebelPlace
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button className="p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Get sidebar classes
  const getSidebarClasses = () => {
    return cn(
      'bg-glass-primary/90 backdrop-blur-xl border-r border-glass-border/50',
      'flex flex-col h-full overflow-hidden',
      sidebarState.isCollapsed ? config.collapsedWidth : config.width,
      behavior === 'fixed' && 'fixed top-0 left-0 z-50',
      behavior === 'sticky' && 'sticky top-0',
      behavior === 'overlay' && 'absolute top-0 left-0 z-50',
      position === 'right' && 'border-r-0 border-l',
      className
    );
  };

  // Sidebar context value
  const sidebarContextValue: SidebarContextType = {
    sidebarState,
    setActiveItem,
    toggleExpanded,
    toggleSection,
    setSearchQuery,
    onItemClick: handleItemClick
  };

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <motion.aside
        ref={sidebarRef}
        className={getSidebarClasses()}
        variants={sidebarVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        {renderHeader()}

        {/* Search */}
        {renderSearch()}

        {/* Body */}
        <div className={cn(
          'flex-1 overflow-auto',
          config.padding,
          bodyClassName
        )}>
          <div className={cn(
            config.itemSpacing
          )}>
            {/* Direct items */}
            {sidebarState.filteredItems.map(item => renderItem(item))}

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
      </motion.aside>
    </SidebarContext.Provider>
  );
};

// Convenience components
export const GlassSidebarCompact: React.FC<Omit<GlassSidebarProps, 'variant' | 'size'>> = (props) => (
  <GlassSidebar {...props} variant="compact" size="sm" />
);

export const GlassSidebarDetailed: React.FC<Omit<GlassSidebarProps, 'variant' | 'size'>> = (props) => (
  <GlassSidebar {...props} variant="detailed" size="lg" />
);

export const GlassSidebarMinimal: React.FC<Omit<GlassSidebarProps, 'variant'>> = (props) => (
  <GlassSidebar {...props} variant="minimal" showHeader={false} showFooter={false} showTitle={false} showDescription={false} />
);

export const GlassSidebarFloating: React.FC<Omit<GlassSidebarProps, 'variant'>> = (props) => (
  <GlassSidebar {...props} variant="floating" behavior="overlay" />
);

export const GlassSidebarOverlay: React.FC<Omit<GlassSidebarProps, 'variant'>> = (props) => (
  <GlassSidebar {...props} variant="overlay" behavior="overlay" />
);

// Example usage component
export const GlassSidebarExample: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const sampleItems: SidebarItem[] = [
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

  const sampleSections: SidebarSection[] = [
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

  const handleItemClick = (item: SidebarItem) => {
    setActiveItem(item.id);
    console.log('Sidebar item clicked:', item);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Sidebar examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Боковые панели</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычная боковая панель
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактная боковая панель
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальная боковая панель
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальная боковая панель
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Плавающая боковая панель
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Наложение боковой панели
          </button>
        </div>
      </div>

      {/* Default sidebar */}
      <div className="flex space-x-4">
        <GlassSidebar
          title="Навигация"
          description="Основная навигация по сайту"
          items={sampleItems}
          sections={sampleSections}
          variant="default"
          size="md"
          position="left"
          behavior="fixed"
          showHeader
          showFooter
          showTitle
          showDescription
          showIcon
          showSearch
          showToggle
          showBadges
          allowSearch
          allowCollapse
          allowExpand
          allowToggle
          onItemClick={handleItemClick}
          onSectionToggle={(sectionId, collapsed) => console.log('Section toggled:', sectionId, collapsed)}
          onSearch={(query) => console.log('Search:', query)}
          onToggle={(collapsed) => console.log('Sidebar toggled:', collapsed)}
        />
        <div className="flex-1 p-4 bg-glass-primary/50 rounded-lg">
          <h4 className="text-white mb-2">Основной контент</h4>
          <p className="text-white/60">Здесь находится основной контент страницы</p>
        </div>
      </div>

      {/* Compact sidebar */}
      <div className="flex space-x-4">
        <GlassSidebarCompact
          title="Быстрая навигация"
          items={sampleItems.slice(0, 3)}
          showHeader
          showTitle
          showIcon
          showBadges
          allowToggle
          onItemClick={handleItemClick}
          onToggle={(collapsed) => console.log('Sidebar toggled:', collapsed)}
        />
        <div className="flex-1 p-4 bg-glass-primary/50 rounded-lg">
          <h4 className="text-white mb-2">Основной контент</h4>
          <p className="text-white/60">Здесь находится основной контент страницы</p>
        </div>
      </div>

      {/* Detailed sidebar */}
      <div className="flex space-x-4">
        <GlassSidebarDetailed
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
          showToggle
          showBadges
          allowSearch
          allowCollapse
          allowExpand
          allowToggle
          onItemClick={handleItemClick}
          onSectionToggle={(sectionId, collapsed) => console.log('Section toggled:', sectionId, collapsed)}
          onSearch={(query) => console.log('Search:', query)}
          onToggle={(collapsed) => console.log('Sidebar toggled:', collapsed)}
        />
        <div className="flex-1 p-4 bg-glass-primary/50 rounded-lg">
          <h4 className="text-white mb-2">Основной контент</h4>
          <p className="text-white/60">Здесь находится основной контент страницы</p>
        </div>
      </div>

      {/* Minimal sidebar */}
      <div className="flex space-x-4">
        <GlassSidebarMinimal
          items={sampleItems.slice(0, 4)}
          showIcon
          showBadges
          onItemClick={handleItemClick}
        />
        <div className="flex-1 p-4 bg-glass-primary/50 rounded-lg">
          <h4 className="text-white mb-2">Основной контент</h4>
          <p className="text-white/60">Здесь находится основной контент страницы</p>
        </div>
      </div>

      {/* Floating sidebar */}
      <div className="flex space-x-4">
        <GlassSidebarFloating
          title="Плавающая панель"
          items={sampleItems}
          sections={sampleSections}
          showHeader
          showTitle
          showIcon
          showBadges
          allowToggle
          onItemClick={handleItemClick}
          onToggle={(collapsed) => console.log('Sidebar toggled:', collapsed)}
        />
        <div className="flex-1 p-4 bg-glass-primary/50 rounded-lg">
          <h4 className="text-white mb-2">Основной контент</h4>
          <p className="text-white/60">Здесь находится основной контент страницы</p>
        </div>
      </div>

      {/* Overlay sidebar */}
      <div className="flex space-x-4">
        <GlassSidebarOverlay
          title="Наложение панели"
          items={sampleItems}
          sections={sampleSections}
          showHeader
          showTitle
          showIcon
          showBadges
          allowToggle
          onItemClick={handleItemClick}
          onToggle={(collapsed) => console.log('Sidebar toggled:', collapsed)}
        />
        <div className="flex-1 p-4 bg-glass-primary/50 rounded-lg">
          <h4 className="text-white mb-2">Основной контент</h4>
          <p className="text-white/60">Здесь находится основной контент страницы</p>
        </div>
      </div>
    </div>
  );
};