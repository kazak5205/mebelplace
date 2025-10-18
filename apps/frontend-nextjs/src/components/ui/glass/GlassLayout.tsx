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
  ShieldPlus,
  ShieldMinus,
  Check,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Menu,
  X,
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
  ShieldPlus as ShieldPlusIcon,
  ShieldMinus as ShieldMinusIcon,
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

export interface LayoutState {
  isSidebarCollapsed: boolean;
  isHeaderVisible: boolean;
  isFooterVisible: boolean;
  isMobileMenuOpen: boolean;
  currentBreakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface GlassLayoutProps {
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'dashboard' | 'landing';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'sidebar' | 'header' | 'footer' | 'full' | 'grid' | 'flex';
  behavior?: 'default' | 'sticky' | 'fixed' | 'absolute' | 'relative';
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  showMain?: boolean;
  showAside?: boolean;
  allowCollapse?: boolean;
  allowResize?: boolean;
  allowDrag?: boolean;
  isCollapsed?: boolean;
  isResizable?: boolean;
  isDraggable?: boolean;
  className?: string;
  headerClassName?: string;
  sidebarClassName?: string;
  mainClassName?: string;
  asideClassName?: string;
  footerClassName?: string;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  main?: React.ReactNode;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  onSidebarToggle?: (collapsed: boolean) => void;
  onLayoutChange?: (layout: string) => void;
  onBreakpointChange?: (breakpoint: string) => void;
}

// Layout Context
interface LayoutContextType {
  layoutState: LayoutState;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setHeaderVisible: (visible: boolean) => void;
  setFooterVisible: (visible: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCurrentBreakpoint: (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl') => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a GlassLayout');
  }
  return context;
};

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-2',
    headerHeight: 'h-12',
    sidebarWidth: 'w-48',
    sidebarCollapsedWidth: 'w-12',
    footerHeight: 'h-12',
    spacing: 'space-y-2',
    gridSpacing: 'gap-2'
  },
  md: {
    padding: 'p-4',
    headerHeight: 'h-16',
    sidebarWidth: 'w-64',
    sidebarCollapsedWidth: 'w-16',
    footerHeight: 'h-16',
    spacing: 'space-y-4',
    gridSpacing: 'gap-4'
  },
  lg: {
    padding: 'p-6',
    headerHeight: 'h-20',
    sidebarWidth: 'w-80',
    sidebarCollapsedWidth: 'w-20',
    footerHeight: 'h-20',
    spacing: 'space-y-6',
    gridSpacing: 'gap-6'
  },
  xl: {
    padding: 'p-8',
    headerHeight: 'h-24',
    sidebarWidth: 'w-96',
    sidebarCollapsedWidth: 'w-24',
    footerHeight: 'h-24',
    spacing: 'space-y-8',
    gridSpacing: 'gap-8'
  }
};

// Animation variants
const layoutVariants = {
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

export const GlassLayout: React.FC<GlassLayoutProps> = ({
  children,
  variant = 'default',
  size = 'md',
  layout = 'full',
  behavior = 'default',
  showHeader = true,
  showFooter = true,
  showSidebar = false,
  showMain = true,
  showAside = false,
  allowCollapse = false,
  allowResize = false,
  allowDrag = false,
  isCollapsed = false,
  isResizable = false,
  isDraggable = false,
  className,
  headerClassName,
  sidebarClassName,
  mainClassName,
  asideClassName,
  footerClassName,
  header,
  sidebar,
  main,
  aside,
  footer,
  onSidebarToggle,
  onLayoutChange,
  onBreakpointChange
}) => {
  const [layoutState, setLayoutState] = useState<LayoutState>({
    isSidebarCollapsed: isCollapsed,
    isHeaderVisible: showHeader,
    isFooterVisible: showFooter,
    isMobileMenuOpen: false,
    currentBreakpoint: 'lg'
  });

  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const layoutRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];

  // Handle breakpoint changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'lg';

      if (width < 640) breakpoint = 'sm';
      else if (width < 768) breakpoint = 'md';
      else if (width < 1024) breakpoint = 'lg';
      else if (width < 1280) breakpoint = 'xl';
      else breakpoint = '2xl';

      setLayoutState(prev => ({
        ...prev,
        currentBreakpoint: breakpoint
      }));

      onBreakpointChange?.(breakpoint);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, [onBreakpointChange]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setLayoutState(prev => ({
      ...prev,
      isSidebarCollapsed: !prev.isSidebarCollapsed
    }));
    onSidebarToggle?.(!layoutState.isSidebarCollapsed);
  };

  // Set sidebar collapsed
  const setSidebarCollapsed = (collapsed: boolean) => {
    setLayoutState(prev => ({
      ...prev,
      isSidebarCollapsed: collapsed
    }));
    onSidebarToggle?.(collapsed);
  };

  // Set header visible
  const setHeaderVisible = (visible: boolean) => {
    setLayoutState(prev => ({
      ...prev,
      isHeaderVisible: visible
    }));
  };

  // Set footer visible
  const setFooterVisible = (visible: boolean) => {
    setLayoutState(prev => ({
      ...prev,
      isFooterVisible: visible
    }));
  };

  // Set mobile menu open
  const setMobileMenuOpen = (open: boolean) => {
    setLayoutState(prev => ({
      ...prev,
      isMobileMenuOpen: open
    }));
  };

  // Set current breakpoint
  const setCurrentBreakpoint = (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl') => {
    setLayoutState(prev => ({
      ...prev,
      currentBreakpoint: breakpoint
    }));
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader || !layoutState.isHeaderVisible) return null;

    return (
      <motion.header
        className={cn(
          'bg-glass-primary/90 backdrop-blur-xl border-b border-glass-border/50',
          config.headerHeight,
          behavior === 'sticky' && 'sticky top-0 z-50',
          behavior === 'fixed' && 'fixed top-0 left-0 right-0 z-50',
          headerClassName
        )}
        variants={layoutVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {header || (
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-white font-semibold">MebelPlace</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </motion.header>
    );
  };

  // Render sidebar
  const renderSidebar = () => {
    if (!showSidebar) return null;

    return (
      <motion.aside
        ref={sidebarRef}
        className={cn(
          'bg-glass-primary/90 backdrop-blur-xl border-r border-glass-border/50',
          'flex flex-col overflow-hidden',
          layoutState.isSidebarCollapsed ? config.sidebarCollapsedWidth : config.sidebarWidth,
          behavior === 'sticky' && 'sticky top-0',
          behavior === 'fixed' && 'fixed top-0 left-0 bottom-0 z-40',
          sidebarClassName
        )}
        variants={sidebarVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {sidebar || (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-glass-border/50">
              <div className="flex items-center justify-between">
                {!layoutState.isSidebarCollapsed && (
                  <h2 className="text-white font-semibold">Навигация</h2>
                )}
                <button
                  onClick={handleSidebarToggle}
                  className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
                >
                  {layoutState.isSidebarCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-2">
              <button className="w-full flex items-center space-x-3 p-2 text-white/80 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200">
                <Home className="w-5 h-5" />
                {!layoutState.isSidebarCollapsed && <span>Главная</span>}
              </button>
              <button className="w-full flex items-center space-x-3 p-2 text-white/80 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200">
                <FileText className="w-5 h-5" />
                {!layoutState.isSidebarCollapsed && <span>Каталог</span>}
              </button>
              <button className="w-full flex items-center space-x-3 p-2 text-white/80 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200">
                <ShoppingCart className="w-5 h-5" />
                {!layoutState.isSidebarCollapsed && <span>Заказы</span>}
              </button>
              <button className="w-full flex items-center space-x-3 p-2 text-white/80 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200">
                <User className="w-5 h-5" />
                {!layoutState.isSidebarCollapsed && <span>Профиль</span>}
              </button>
            </div>
          </div>
        )}
      </motion.aside>
    );
  };

  // Render main content
  const renderMain = () => {
    if (!showMain) return null;

    return (
      <motion.main
        className={cn(
          'flex-1 overflow-auto',
          config.padding,
          mainClassName
        )}
        variants={layoutVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {main || (
          <div className="space-y-6">
            <div className="bg-glass-primary/50 backdrop-blur-xl border border-glass-border/50 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Добро пожаловать в MebelPlace</h2>
              <p className="text-white/80">
                Здесь находится основной контент страницы. Вы можете разместить здесь любые компоненты и элементы.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="bg-glass-primary/50 backdrop-blur-xl border border-glass-border/50 rounded-lg p-4"
                >
                  <h3 className="text-white font-medium mb-2">Карточка {item}</h3>
                  <p className="text-white/60 text-sm">
                    Описание карточки {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.main>
    );
  };

  // Render aside
  const renderAside = () => {
    if (!showAside) return null;

    return (
      <motion.aside
        className={cn(
          'bg-glass-primary/50 backdrop-blur-xl border-l border-glass-border/50',
          'w-64 flex flex-col overflow-hidden',
          asideClassName
        )}
        variants={layoutVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {aside || (
          <div className="p-4 space-y-4">
            <h3 className="text-white font-semibold">Боковая панель</h3>
            <div className="space-y-2">
              <div className="p-3 bg-glass-secondary/30 rounded-lg">
                <h4 className="text-white text-sm font-medium">Информация</h4>
                <p className="text-white/60 text-xs">Дополнительная информация</p>
              </div>
              <div className="p-3 bg-glass-secondary/30 rounded-lg">
                <h4 className="text-white text-sm font-medium">Статистика</h4>
                <p className="text-white/60 text-xs">Статистические данные</p>
              </div>
            </div>
          </div>
        )}
      </motion.aside>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!showFooter || !layoutState.isFooterVisible) return null;

    return (
      <motion.footer
        className={cn(
          'bg-glass-primary/90 backdrop-blur-xl border-t border-glass-border/50',
          config.footerHeight,
          behavior === 'sticky' && 'sticky bottom-0 z-50',
          behavior === 'fixed' && 'fixed bottom-0 left-0 right-0 z-50',
          footerClassName
        )}
        variants={layoutVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {footer || (
          <div className="flex items-center justify-between h-full px-4">
            <div className="text-white/60 text-sm">
              © 2024 MebelPlace. Все права защищены.
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-white/60 hover:text-white transition-colors duration-200">
                <Globe className="w-4 h-4" />
              </button>
              <button className="text-white/60 hover:text-white transition-colors duration-200">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.footer>
    );
  };

  // Get layout classes
  const getLayoutClasses = () => {
    return cn(
      'min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
      'flex flex-col',
      className
    );
  };

  // Get content classes
  const getContentClasses = () => {
    return cn(
      'flex flex-1',
      layout === 'sidebar' && 'flex-row',
      layout === 'header' && 'flex-col',
      layout === 'footer' && 'flex-col',
      layout === 'full' && 'flex-col',
      layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      layout === 'flex' && 'flex flex-wrap'
    );
  };

  // Layout context value
  const layoutContextValue: LayoutContextType = {
    layoutState,
    setSidebarCollapsed,
    setHeaderVisible,
    setFooterVisible,
    setMobileMenuOpen,
    setCurrentBreakpoint
  };

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <motion.div
        ref={layoutRef}
        className={getLayoutClasses()}
        variants={layoutVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        {renderHeader()}

        {/* Main content area */}
        <div className={getContentClasses()}>
          {/* Sidebar */}
          {renderSidebar()}

          {/* Main content */}
          {renderMain()}

          {/* Aside */}
          {renderAside()}
        </div>

        {/* Footer */}
        {renderFooter()}

        {/* Custom children */}
        {children}

        {/* Glass effect overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />
      </motion.div>
    </LayoutContext.Provider>
  );
};

// Convenience components
export const GlassLayoutCompact: React.FC<Omit<GlassLayoutProps, 'variant' | 'size'>> = (props) => (
  <GlassLayout {...props} variant="compact" size="sm" />
);

export const GlassLayoutDetailed: React.FC<Omit<GlassLayoutProps, 'variant' | 'size'>> = (props) => (
  <GlassLayout {...props} variant="detailed" size="lg" />
);

export const GlassLayoutMinimal: React.FC<Omit<GlassLayoutProps, 'variant'>> = (props) => (
  <GlassLayout {...props} variant="minimal" showHeader={false} showFooter={false} showSidebar={false} />
);

export const GlassLayoutDashboard: React.FC<Omit<GlassLayoutProps, 'variant'>> = (props) => (
  <GlassLayout {...props} variant="dashboard" layout="sidebar" showHeader showSidebar showMain allowCollapse />
);

export const GlassLayoutLanding: React.FC<Omit<GlassLayoutProps, 'variant'>> = (props) => (
  <GlassLayout {...props} variant="landing" layout="header" showHeader showFooter showMain />
);

// Example usage component
export const GlassLayoutExample: React.FC = () => {
  const [currentLayout, setCurrentLayout] = useState('full');

  const handleLayoutChange = (layout: string) => {
    setCurrentLayout(layout);
    console.log('Layout changed:', layout);
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    console.log('Sidebar toggled:', collapsed);
  };

  const handleBreakpointChange = (breakpoint: string) => {
    console.log('Breakpoint changed:', breakpoint);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Layout examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Макеты</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычный макет
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактный макет
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальный макет
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальный макет
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Дашборд макет
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Лендинг макет
          </button>
        </div>
      </div>

      {/* Default layout */}
      <GlassLayout
        variant="default"
        size="md"
        layout="full"
        behavior="default"
        showHeader
        showFooter
        showMain
        allowCollapse
        onLayoutChange={handleLayoutChange}
        onSidebarToggle={handleSidebarToggle}
        onBreakpointChange={handleBreakpointChange}
      />

      {/* Compact layout */}
      <GlassLayoutCompact
        layout="header"
        showHeader
        showMain
        onLayoutChange={handleLayoutChange}
      />

      {/* Detailed layout */}
      <GlassLayoutDetailed
        layout="sidebar"
        showHeader
        showSidebar
        showMain
        showAside
        showFooter
        allowCollapse
        onLayoutChange={handleLayoutChange}
        onSidebarToggle={handleSidebarToggle}
      />

      {/* Minimal layout */}
      <GlassLayoutMinimal
        layout="full"
        showMain
        onLayoutChange={handleLayoutChange}
      />

      {/* Dashboard layout */}
      <GlassLayoutDashboard
        size="lg"
        showHeader
        showSidebar
        showMain
        showAside
        allowCollapse
        onLayoutChange={handleLayoutChange}
        onSidebarToggle={handleSidebarToggle}
      />

      {/* Landing layout */}
      <GlassLayoutLanding
        size="xl"
        showHeader
        showMain
        showFooter
        onLayoutChange={handleLayoutChange}
      />
    </div>
  );
};