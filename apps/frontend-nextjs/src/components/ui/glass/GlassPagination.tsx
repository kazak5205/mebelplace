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

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  startItem: number;
  endItem: number;
}

export interface GlassPaginationProps {
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'dots' | 'numbers' | 'arrows';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  behavior?: 'default' | 'scroll' | 'infinite' | 'load-more';
  showInfo?: boolean;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  showPageSize?: boolean;
  showJumpTo?: boolean;
  showTotal?: boolean;
  showRange?: boolean;
  allowPageSize?: boolean;
  allowJumpTo?: boolean;
  allowInfinite?: boolean;
  allowLoadMore?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  infoClassName?: string;
  controlsClassName?: string;
  pageSizeClassName?: string;
  jumpToClassName?: string;
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  maxVisiblePages?: number;
  firstPageText?: string;
  lastPageText?: string;
  prevPageText?: string;
  nextPageText?: string;
  pageSizeText?: string;
  jumpToText?: string;
  totalText?: string;
  rangeText?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onJumpToPage?: (page: number) => void;
  onLoadMore?: () => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-2',
    buttonPadding: 'px-2 py-1',
    textSize: 'text-xs',
    iconSize: 'w-3 h-3',
    spacing: 'space-x-1',
    infoSpacing: 'space-y-1'
  },
  md: {
    padding: 'p-4',
    buttonPadding: 'px-3 py-2',
    textSize: 'text-sm',
    iconSize: 'w-4 h-4',
    spacing: 'space-x-2',
    infoSpacing: 'space-y-2'
  },
  lg: {
    padding: 'p-6',
    buttonPadding: 'px-4 py-3',
    textSize: 'text-base',
    iconSize: 'w-5 h-5',
    spacing: 'space-x-3',
    infoSpacing: 'space-y-3'
  },
  xl: {
    padding: 'p-8',
    buttonPadding: 'px-5 py-4',
    textSize: 'text-lg',
    iconSize: 'w-6 h-6',
    spacing: 'space-x-4',
    infoSpacing: 'space-y-4'
  }
};

// Animation variants
const paginationVariants = {
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

const buttonVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.8
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassPagination: React.FC<GlassPaginationProps> = ({
  children,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  behavior = 'default',
  showInfo = true,
  showFirstLast = true,
  showPrevNext = true,
  showPageNumbers = true,
  showPageSize = false,
  showJumpTo = false,
  showTotal = true,
  showRange = true,
  allowPageSize = false,
  allowJumpTo = false,
  allowInfinite = false,
  allowLoadMore = false,
  isDisabled = false,
  isLoading = false,
  className,
  infoClassName,
  controlsClassName,
  pageSizeClassName,
  jumpToClassName,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 10,
  totalItems = 0,
  pageSizeOptions = [10, 20, 50, 100],
  maxVisiblePages = 5,
  firstPageText = 'Первая',
  lastPageText = 'Последняя',
  prevPageText = 'Предыдущая',
  nextPageText = 'Следующая',
  pageSizeText = 'На странице:',
  jumpToText = 'Перейти к:',
  totalText = 'Всего:',
  rangeText = 'Показано:',
  onPageChange,
  onPageSizeChange,
  onJumpToPage,
  onLoadMore
}) => {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    startItem: (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalItems)
  });

  const [jumpToPage, setJumpToPage] = useState<string>('');

  const paginationRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];

  // Update pagination state
  useEffect(() => {
    setPaginationState({
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems,
      startItem: (currentPage - 1) * itemsPerPage + 1,
      endItem: Math.min(currentPage * itemsPerPage, totalItems)
    });
  }, [currentPage, totalPages, itemsPerPage, totalItems]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || isDisabled) return;
    
    onPageChange?.(page);
  };

  // Handle page size change
  const handlePageSizeChange = (pageSize: number) => {
    if (pageSize === itemsPerPage || isDisabled) return;
    
    onPageSizeChange?.(pageSize);
  };

  // Handle jump to page
  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      onJumpToPage?.(page);
      setJumpToPage('');
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (isDisabled || isLoading) return;
    onLoadMore?.();
  };

  // Generate page numbers
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);
      
      if (currentPage <= halfVisible) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1;
      }
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Render page button
  const renderPageButton = (page: number | string, index: number) => {
    const isCurrentPage = page === currentPage;
    const isDisabled = page === '...' || isDisabled;

    return (
      <motion.button
        key={index}
        className={cn(
          'flex items-center justify-center rounded-lg transition-colors duration-200',
          config.buttonPadding,
          config.textSize,
          isCurrentPage && 'bg-orange-500/20 text-orange-300',
          !isCurrentPage && 'text-white/80 hover:bg-glass-secondary/30 hover:text-white',
          isDisabled && 'opacity-50 cursor-not-allowed',
          variant === 'dots' && 'w-2 h-2 rounded-full',
          variant === 'numbers' && 'min-w-[2.5rem]',
          variant === 'arrows' && 'p-2'
        )}
        onClick={() => typeof page === 'number' && handlePageChange(page)}
        disabled={isDisabled}
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {variant === 'dots' ? (
          <div className={cn(
            'w-2 h-2 rounded-full',
            isCurrentPage ? 'bg-orange-400' : 'bg-white/60'
          )} />
        ) : (
          page
        )}
      </motion.button>
    );
  };

  // Render navigation button
  const renderNavButton = (
    onClick: () => void,
    disabled: boolean,
    icon: React.ComponentType<{ className?: string }>,
    text: string,
    showText: boolean = true
  ) => {
    return (
      <motion.button
        className={cn(
          'flex items-center space-x-2 rounded-lg transition-colors duration-200',
          config.buttonPadding,
          config.textSize,
          disabled || isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'text-white/80 hover:bg-glass-secondary/30 hover:text-white'
        )}
        onClick={onClick}
        disabled={disabled || isDisabled}
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <icon className={config.iconSize} />
        {showText && <span>{text}</span>}
      </motion.button>
    );
  };

  // Render info
  const renderInfo = () => {
    if (!showInfo) return null;

    return (
      <div className={cn(
        'flex items-center space-x-4 text-white/60',
        config.textSize,
        config.infoSpacing,
        infoClassName
      )}>
        {showTotal && (
          <span>
            {totalText} {totalItems}
          </span>
        )}
        {showRange && (
          <span>
            {rangeText} {paginationState.startItem}-{paginationState.endItem}
          </span>
        )}
      </div>
    );
  };

  // Render page size selector
  const renderPageSizeSelector = () => {
    if (!allowPageSize || !showPageSize) return null;

    return (
      <div className={cn(
        'flex items-center space-x-2',
        pageSizeClassName
      )}>
        <span className={cn(
          'text-white/60',
          config.textSize
        )}>
          {pageSizeText}
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
          disabled={isDisabled}
          className={cn(
            'px-3 py-1 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50',
            config.textSize
          )}
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Render jump to page
  const renderJumpToPage = () => {
    if (!allowJumpTo || !showJumpTo) return null;

    return (
      <div className={cn(
        'flex items-center space-x-2',
        jumpToClassName
      )}>
        <span className={cn(
          'text-white/60',
          config.textSize
        )}>
          {jumpToText}
        </span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={jumpToPage}
          onChange={(e) => setJumpToPage(e.target.value)}
          disabled={isDisabled}
          className={cn(
            'w-16 px-2 py-1 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50',
            config.textSize
          )}
        />
        <button
          onClick={handleJumpToPage}
          disabled={isDisabled || !jumpToPage}
          className={cn(
            'px-3 py-1 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 rounded-lg transition-colors duration-200',
            config.textSize
          )}
        >
          Перейти
        </button>
      </div>
    );
  };

  // Render load more button
  const renderLoadMoreButton = () => {
    if (!allowLoadMore || !allowLoadMore) return null;

    return (
      <motion.button
        onClick={handleLoadMore}
        disabled={isDisabled || isLoading}
        className={cn(
          'flex items-center space-x-2 px-6 py-3 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 rounded-lg transition-colors duration-200',
          config.textSize,
          (isDisabled || isLoading) && 'opacity-50 cursor-not-allowed'
        )}
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        <span>Загрузить еще</span>
      </motion.button>
    );
  };

  // Render controls
  const renderControls = () => {
    const pageNumbers = generatePageNumbers();

    return (
      <div className={cn(
        'flex items-center',
        config.spacing,
        controlsClassName
      )}>
        {/* First page button */}
        {showFirstLast && (
          renderNavButton(
            () => handlePageChange(1),
            currentPage === 1,
            ChevronLeft,
            firstPageText,
            variant !== 'arrows'
          )
        )}

        {/* Previous page button */}
        {showPrevNext && (
          renderNavButton(
            () => handlePageChange(currentPage - 1),
            currentPage === 1,
            ChevronLeft,
            prevPageText,
            variant !== 'arrows'
          )
        )}

        {/* Page numbers */}
        {showPageNumbers && (
          <div className={cn(
            'flex items-center',
            config.spacing
          )}>
            {pageNumbers.map((page, index) => renderPageButton(page, index))}
          </div>
        )}

        {/* Next page button */}
        {showPrevNext && (
          renderNavButton(
            () => handlePageChange(currentPage + 1),
            currentPage === totalPages,
            ChevronRight,
            nextPageText,
            variant !== 'arrows'
          )
        )}

        {/* Last page button */}
        {showFirstLast && (
          renderNavButton(
            () => handlePageChange(totalPages),
            currentPage === totalPages,
            ChevronRight,
            lastPageText,
            variant !== 'arrows'
          )
        )}
      </div>
    );
  };

  // Get pagination classes
  const getPaginationClasses = () => {
    return cn(
      'bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-2xl shadow-glass-lg',
      'flex flex-col',
      config.padding,
      className
    );
  };

  return (
    <motion.div
      ref={paginationRef}
      className={getPaginationClasses()}
      variants={paginationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Info */}
      {renderInfo()}

      {/* Controls */}
      <div className={cn(
        'flex items-center justify-between',
        config.spacing
      )}>
        {/* Page size selector */}
        {renderPageSizeSelector()}

        {/* Main controls */}
        {renderControls()}

        {/* Jump to page */}
        {renderJumpToPage()}
      </div>

      {/* Load more button */}
      {renderLoadMoreButton()}

      {/* Custom children */}
      {children}

      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
};

// Convenience components
export const GlassPaginationCompact: React.FC<Omit<GlassPaginationProps, 'variant' | 'size'>> = (props) => (
  <GlassPagination {...props} variant="compact" size="sm" />
);

export const GlassPaginationDetailed: React.FC<Omit<GlassPaginationProps, 'variant' | 'size'>> = (props) => (
  <GlassPagination {...props} variant="detailed" size="lg" />
);

export const GlassPaginationMinimal: React.FC<Omit<GlassPaginationProps, 'variant'>> = (props) => (
  <GlassPagination {...props} variant="minimal" showInfo={false} showFirstLast={false} showTotal={false} showRange={false} />
);

export const GlassPaginationDots: React.FC<Omit<GlassPaginationProps, 'variant'>> = (props) => (
  <GlassPagination {...props} variant="dots" showPageNumbers={false} />
);

export const GlassPaginationNumbers: React.FC<Omit<GlassPaginationProps, 'variant'>> = (props) => (
  <GlassPagination {...props} variant="numbers" showFirstLast={false} showPrevNext={false} />
);

export const GlassPaginationArrows: React.FC<Omit<GlassPaginationProps, 'variant'>> = (props) => (
  <GlassPagination {...props} variant="arrows" showPageNumbers={false} showFirstLast={false} />
);

// Example usage component
export const GlassPaginationExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(250);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log('Page changed:', page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setItemsPerPage(pageSize);
    setCurrentPage(1);
    console.log('Page size changed:', pageSize);
  };

  const handleJumpToPage = (page: number) => {
    setCurrentPage(page);
    console.log('Jumped to page:', page);
  };

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTotalItems(prev => prev + 50);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Pagination examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Пагинация</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычная пагинация
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактная пагинация
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальная пагинация
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальная пагинация
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Пагинация-точки
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Пагинация-числа
          </button>
          <button className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors duration-200">
            Пагинация-стрелки
          </button>
        </div>
      </div>

      {/* Default pagination */}
      <GlassPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        variant="default"
        size="md"
        orientation="horizontal"
        behavior="default"
        showInfo
        showFirstLast
        showPrevNext
        showPageNumbers
        showPageSize
        showJumpTo
        showTotal
        showRange
        allowPageSize
        allowJumpTo
        allowLoadMore
        pageSizeOptions={[10, 20, 50, 100]}
        maxVisiblePages={5}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onJumpToPage={handleJumpToPage}
        onLoadMore={handleLoadMore}
      />

      {/* Compact pagination */}
      <GlassPaginationCompact
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        showInfo
        showFirstLast
        showPrevNext
        showPageNumbers
        onPageChange={handlePageChange}
      />

      {/* Detailed pagination */}
      <GlassPaginationDetailed
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        showInfo
        showFirstLast
        showPrevNext
        showPageNumbers
        showPageSize
        showJumpTo
        showTotal
        showRange
        allowPageSize
        allowJumpTo
        allowLoadMore
        pageSizeOptions={[10, 20, 50, 100]}
        maxVisiblePages={7}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onJumpToPage={handleJumpToPage}
        onLoadMore={handleLoadMore}
      />

      {/* Minimal pagination */}
      <GlassPaginationMinimal
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        showPrevNext
        showPageNumbers
        onPageChange={handlePageChange}
      />

      {/* Dots pagination */}
      <GlassPaginationDots
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        showInfo
        showFirstLast
        showPrevNext
        onPageChange={handlePageChange}
      />

      {/* Numbers pagination */}
      <GlassPaginationNumbers
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        showInfo
        showPageNumbers
        onPageChange={handlePageChange}
      />

      {/* Arrows pagination */}
      <GlassPaginationArrows
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        showInfo
        showFirstLast
        showPrevNext
        onPageChange={handlePageChange}
      />
    </div>
  );
};
