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

export interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string | number;
  color?: string;
  disabled?: boolean;
  closable?: boolean;
  loading?: boolean;
  error?: boolean;
  warning?: boolean;
  success?: boolean;
  onClick?: () => void;
}

export interface TabsState {
  activeTab: string | null;
  tabs: TabItem[];
  scrollPosition: number;
  isScrolling: boolean;
}

export interface GlassTabsProps {
  children?: React.ReactNode;
  tabs?: TabItem[];
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'pills' | 'underline' | 'cards';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  behavior?: 'default' | 'scrollable' | 'dropdown' | 'accordion';
  showContent?: boolean;
  showIcons?: boolean;
  showBadges?: boolean;
  showClose?: boolean;
  showAdd?: boolean;
  showScroll?: boolean;
  allowReorder?: boolean;
  allowClose?: boolean;
  allowAdd?: boolean;
  allowScroll?: boolean;
  isScrollable?: boolean;
  isReorderable?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  disabledTabClassName?: string;
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabAdd?: () => void;
  onTabReorder?: (tabs: TabItem[]) => void;
}

// Tabs Context
interface TabsContextType {
  tabsState: TabsState;
  setActiveTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  addTab: (tab: TabItem) => void;
  reorderTabs: (tabs: TabItem[]) => void;
  onTabChange: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within a GlassTabs');
  }
  return context;
};

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-2',
    tabPadding: 'px-3 py-1.5',
    contentPadding: 'p-3',
    tabTextSize: 'text-xs',
    contentTextSize: 'text-sm',
    iconSize: 'w-4 h-4',
    spacing: 'space-x-1',
    contentSpacing: 'space-y-2'
  },
  md: {
    padding: 'p-4',
    tabPadding: 'px-4 py-2',
    contentPadding: 'p-4',
    tabTextSize: 'text-sm',
    contentTextSize: 'text-base',
    iconSize: 'w-5 h-5',
    spacing: 'space-x-2',
    contentSpacing: 'space-y-3'
  },
  lg: {
    padding: 'p-6',
    tabPadding: 'px-5 py-3',
    contentPadding: 'p-6',
    tabTextSize: 'text-base',
    contentTextSize: 'text-lg',
    iconSize: 'w-6 h-6',
    spacing: 'space-x-3',
    contentSpacing: 'space-y-4'
  },
  xl: {
    padding: 'p-8',
    tabPadding: 'px-6 py-4',
    contentPadding: 'p-8',
    tabTextSize: 'text-lg',
    contentTextSize: 'text-xl',
    iconSize: 'w-7 h-7',
    spacing: 'space-x-4',
    contentSpacing: 'space-y-5'
  }
};

// Animation variants
const tabsVariants = {
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

const tabVariants = {
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

const contentVariants = {
  initial: { 
    opacity: 0, 
    y: 10
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
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassTabs: React.FC<GlassTabsProps> = ({
  children,
  tabs = [],
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  behavior = 'default',
  showContent = true,
  showIcons = true,
  showBadges = true,
  showClose = false,
  showAdd = false,
  showScroll = false,
  allowReorder = false,
  allowClose = false,
  allowAdd = false,
  allowScroll = false,
  isScrollable = false,
  isReorderable = false,
  className,
  headerClassName,
  contentClassName,
  tabClassName,
  activeTabClassName,
  disabledTabClassName,
  defaultActiveTab,
  onTabChange,
  onTabClose,
  onTabAdd,
  onTabReorder
}) => {
  const [tabsState, setTabsState] = useState<TabsState>({
    activeTab: defaultActiveTab || (tabs.length > 0 ? tabs[0].id : null),
    tabs: tabs,
    scrollPosition: 0,
    isScrolling: false
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setTabsState(prev => ({
      ...prev,
      activeTab: tabId
    }));
    onTabChange?.(tabId);
  };

  // Handle tab close
  const handleTabClose = (tabId: string) => {
    const newTabs = tabsState.tabs.filter(tab => tab.id !== tabId);
    const newActiveTab = tabsState.activeTab === tabId 
      ? (newTabs.length > 0 ? newTabs[0].id : null)
      : tabsState.activeTab;

    setTabsState(prev => ({
      ...prev,
      tabs: newTabs,
      activeTab: newActiveTab
    }));

    onTabClose?.(tabId);
  };

  // Handle tab add
  const handleTabAdd = () => {
    onTabAdd?.();
  };

  // Handle tab reorder
  const handleTabReorder = (newTabs: TabItem[]) => {
    setTabsState(prev => ({
      ...prev,
      tabs: newTabs
    }));
    onTabReorder?.(newTabs);
  };

  // Handle scroll
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 200;
    const currentScroll = scrollRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;

    scrollRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  // Render tab
  const renderTab = (tab: TabItem, index: number) => {
    const isActive = tabsState.activeTab === tab.id;
    const isDisabled = tab.disabled;

    return (
      <motion.button
        key={tab.id}
        className={cn(
          'flex items-center space-x-2 cursor-pointer transition-colors duration-200 rounded-lg',
          config.tabPadding,
          config.tabTextSize,
          variant === 'default' && 'text-white/80 hover:text-white hover:bg-glass-secondary/30',
          variant === 'compact' && 'text-white/70 hover:text-white hover:bg-glass-secondary/20',
          variant === 'minimal' && 'text-white/60 hover:text-white hover:bg-glass-secondary/10',
          variant === 'detailed' && 'text-white/80 hover:text-white hover:bg-glass-secondary/30',
          variant === 'pills' && 'text-white/80 hover:text-white hover:bg-glass-secondary/30 rounded-full',
          variant === 'underline' && 'text-white/80 hover:text-white border-b-2 border-transparent hover:border-orange-400',
          variant === 'cards' && 'text-white/80 hover:text-white hover:bg-glass-secondary/30 border border-glass-border/50',
          isActive && variant === 'default' && 'bg-orange-500/20 text-orange-300',
          isActive && variant === 'compact' && 'bg-orange-500/15 text-orange-300',
          isActive && variant === 'minimal' && 'bg-orange-500/10 text-orange-300',
          isActive && variant === 'detailed' && 'bg-orange-500/20 text-orange-300',
          isActive && variant === 'pills' && 'bg-orange-500/20 text-orange-300',
          isActive && variant === 'underline' && 'text-orange-300 border-orange-400',
          isActive && variant === 'cards' && 'bg-orange-500/20 text-orange-300 border-orange-400/50',
          isDisabled && 'opacity-50 cursor-not-allowed',
          tabClassName,
          isActive && activeTabClassName,
          isDisabled && disabledTabClassName
        )}
        onClick={() => !isDisabled && handleTabChange(tab.id)}
        disabled={isDisabled}
        variants={tabVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Tab icon */}
        {tab.icon && showIcons && (
          <tab.icon className={cn(
            config.iconSize,
            isActive ? 'text-orange-400' : 'text-white/60'
          )} />
        )}

        {/* Tab content */}
        <div className="flex items-center space-x-2">
          <span>{tab.label}</span>
          {tab.badge && showBadges && (
            <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full">
              {tab.badge}
            </span>
          )}
        </div>

        {/* Tab status indicators */}
        {tab.loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {tab.error && (
          <AlertCircle className="w-4 h-4 text-red-400" />
        )}
        {tab.warning && (
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
        )}
        {tab.success && (
          <CheckCircle className="w-4 h-4 text-green-400" />
        )}

        {/* Close button */}
        {tab.closable && allowClose && showClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTabClose(tab.id);
            }}
            className="p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </motion.button>
    );
  };

  // Render tabs header
  const renderTabsHeader = () => {
    return (
      <div className={cn(
        'flex items-center',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        config.spacing,
        headerClassName
      )}>
        {/* Scroll buttons */}
        {allowScroll && showScroll && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs container */}
        <div
          ref={scrollRef}
          className={cn(
            'flex items-center',
            orientation === 'horizontal' ? 'flex-row overflow-x-auto' : 'flex-col overflow-y-auto',
            config.spacing,
            'scrollbar-hide'
          )}
        >
          {tabsState.tabs.map((tab, index) => renderTab(tab, index))}
        </div>

        {/* Add button */}
        {allowAdd && showAdd && (
          <button
            onClick={handleTabAdd}
            className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    if (!showContent) return null;

    const activeTab = tabsState.tabs.find(tab => tab.id === tabsState.activeTab);
    if (!activeTab) return null;

    return (
      <motion.div
        className={cn(
          'bg-glass-primary/50 backdrop-blur-xl border border-glass-border/50 rounded-lg',
          config.contentPadding,
          contentClassName
        )}
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        key={tabsState.activeTab}
      >
        {activeTab.content || (
          <div className={cn(
            'text-white/80',
            config.contentTextSize,
            config.contentSpacing
          )}>
            <h3 className="text-white font-semibold mb-2">{activeTab.label}</h3>
            {activeTab.description && (
              <p className="text-white/60">{activeTab.description}</p>
            )}
            <p>Содержимое вкладки "{activeTab.label}"</p>
          </div>
        )}
      </motion.div>
    );
  };

  // Get tabs classes
  const getTabsClasses = () => {
    return cn(
      'bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-2xl shadow-glass-lg',
      'flex flex-col',
      config.padding,
      className
    );
  };

  // Tabs context value
  const tabsContextValue: TabsContextType = {
    tabsState,
    setActiveTab: handleTabChange,
    closeTab: handleTabClose,
    addTab: (tab) => {
      setTabsState(prev => ({
        ...prev,
        tabs: [...prev.tabs, tab]
      }));
    },
    reorderTabs: handleTabReorder,
    onTabChange: handleTabChange
  };

  return (
    <TabsContext.Provider value={tabsContextValue}>
      <motion.div
        ref={tabsRef}
        className={getTabsClasses()}
        variants={tabsVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Tabs header */}
        {renderTabsHeader()}

        {/* Tab content */}
        {renderTabContent()}

        {/* Custom children */}
        {children}

        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
      </motion.div>
    </TabsContext.Provider>
  );
};

// Convenience components
export const GlassTabsCompact: React.FC<Omit<GlassTabsProps, 'variant' | 'size'>> = (props) => (
  <GlassTabs {...props} variant="compact" size="sm" />
);

export const GlassTabsDetailed: React.FC<Omit<GlassTabsProps, 'variant' | 'size'>> = (props) => (
  <GlassTabs {...props} variant="detailed" size="lg" />
);

export const GlassTabsMinimal: React.FC<Omit<GlassTabsProps, 'variant'>> = (props) => (
  <GlassTabs {...props} variant="minimal" showContent={false} showIcons={false} showBadges={false} />
);

export const GlassTabsPills: React.FC<Omit<GlassTabsProps, 'variant'>> = (props) => (
  <GlassTabs {...props} variant="pills" />
);

export const GlassTabsUnderline: React.FC<Omit<GlassTabsProps, 'variant'>> = (props) => (
  <GlassTabs {...props} variant="underline" />
);

export const GlassTabsCards: React.FC<Omit<GlassTabsProps, 'variant'>> = (props) => (
  <GlassTabs {...props} variant="cards" />
);

// Example usage component
export const GlassTabsExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab1');

  const sampleTabs: TabItem[] = [
    {
      id: 'tab1',
      label: 'Главная',
      icon: Home,
      description: 'Основная информация',
      content: (
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Главная страница</h3>
          <p className="text-white/80">Добро пожаловать на главную страницу!</p>
        </div>
      )
    },
    {
      id: 'tab2',
      label: 'Каталог',
      icon: FileText,
      description: 'Просмотр каталога',
      badge: '12',
      content: (
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Каталог товаров</h3>
          <p className="text-white/80">Здесь находится каталог товаров</p>
        </div>
      )
    },
    {
      id: 'tab3',
      label: 'Заказы',
      icon: ShoppingCart,
      description: 'Управление заказами',
      badge: 3,
      content: (
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Заказы</h3>
          <p className="text-white/80">Здесь находятся ваши заказы</p>
        </div>
      )
    },
    {
      id: 'tab4',
      label: 'Профиль',
      icon: User,
      description: 'Личный кабинет',
      content: (
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Профиль пользователя</h3>
          <p className="text-white/80">Здесь находится информация о профиле</p>
        </div>
      )
    },
    {
      id: 'tab5',
      label: 'Настройки',
      icon: Settings,
      description: 'Настройки системы',
      closable: true,
      content: (
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Настройки</h3>
          <p className="text-white/80">Здесь находятся настройки системы</p>
        </div>
      )
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    console.log('Tab changed:', tabId);
  };

  const handleTabClose = (tabId: string) => {
    console.log('Tab closed:', tabId);
  };

  const handleTabAdd = () => {
    console.log('Add new tab');
  };

  return (
    <div className="space-y-8 p-8">
      {/* Tabs examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Вкладки</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычные вкладки
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактные вкладки
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальные вкладки
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальные вкладки
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Вкладки-пилюли
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Подчеркнутые вкладки
          </button>
          <button className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors duration-200">
            Вкладки-карточки
          </button>
        </div>
      </div>

      {/* Default tabs */}
      <GlassTabs
        tabs={sampleTabs}
        variant="default"
        size="md"
        orientation="horizontal"
        behavior="default"
        showContent
        showIcons
        showBadges
        showClose
        showAdd
        showScroll
        allowClose
        allowAdd
        allowScroll
        defaultActiveTab="tab1"
        onTabChange={handleTabChange}
        onTabClose={handleTabClose}
        onTabAdd={handleTabAdd}
      />

      {/* Compact tabs */}
      <GlassTabsCompact
        tabs={sampleTabs.slice(0, 3)}
        showContent
        showIcons
        showBadges
        onTabChange={handleTabChange}
      />

      {/* Detailed tabs */}
      <GlassTabsDetailed
        tabs={sampleTabs}
        showContent
        showIcons
        showBadges
        showClose
        showAdd
        showScroll
        allowClose
        allowAdd
        allowScroll
        onTabChange={handleTabChange}
        onTabClose={handleTabClose}
        onTabAdd={handleTabAdd}
      />

      {/* Minimal tabs */}
      <GlassTabsMinimal
        tabs={sampleTabs.slice(0, 4)}
        onTabChange={handleTabChange}
      />

      {/* Pills tabs */}
      <GlassTabsPills
        tabs={sampleTabs}
        showContent
        showIcons
        showBadges
        onTabChange={handleTabChange}
      />

      {/* Underline tabs */}
      <GlassTabsUnderline
        tabs={sampleTabs}
        showContent
        showIcons
        showBadges
        onTabChange={handleTabChange}
      />

      {/* Cards tabs */}
      <GlassTabsCards
        tabs={sampleTabs}
        showContent
        showIcons
        showBadges
        onTabChange={handleTabChange}
      />
    </div>
  );
};