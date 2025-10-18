'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  GripVertical,
  GripHorizontal,
  Move,
  RotateCcw,
  Save,
  Download,
  Share2,
  Edit,
  Trash2,
  Plus,
  Minus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  Home,
  User,
  Bell,
  Heart,
  Star,
  Eye,
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  Menu,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom
} from 'lucide-react';

export interface DrawerAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface GlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'left' | 'right' | 'top' | 'bottom';
  showHeader?: boolean;
  showFooter?: boolean;
  showCloseButton?: boolean;
  showBackdrop?: boolean;
  showOverlay?: boolean;
  showActions?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  showProgress?: boolean;
  showResizeHandle?: boolean;
  showDragHandle?: boolean;
  showCollapseButton?: boolean;
  showExpandButton?: boolean;
  allowBackdropClose?: boolean;
  allowEscapeClose?: boolean;
  allowDrag?: boolean;
  allowResize?: boolean;
  allowCollapse?: boolean;
  allowExpand?: boolean;
  isClosable?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  isCollapsible?: boolean;
  isExpandable?: boolean;
  isPersistent?: boolean;
  isOverlay?: boolean;
  className?: string;
  backdropClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  actions?: DrawerAction[];
  icon?: React.ComponentType<{ className?: string }>;
  progress?: number;
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  zIndex?: number;
  onOpen?: () => void;
  onCloseComplete?: () => void;
  onCollapse?: () => void;
  onExpand?: () => void;
  onResize?: (width: number, height: number) => void;
  onAction?: (actionId: string) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    width: 'w-64',
    height: 'h-64',
    padding: 'p-4',
    headerPadding: 'p-4 pb-2',
    footerPadding: 'p-4 pt-2',
    titleSize: 'text-lg',
    descriptionSize: 'text-sm'
  },
  md: {
    width: 'w-80',
    height: 'h-80',
    padding: 'p-6',
    headerPadding: 'p-6 pb-4',
    footerPadding: 'p-6 pt-4',
    titleSize: 'text-xl',
    descriptionSize: 'text-base'
  },
  lg: {
    width: 'w-96',
    height: 'h-96',
    padding: 'p-8',
    headerPadding: 'p-8 pb-6',
    footerPadding: 'p-8 pt-6',
    titleSize: 'text-2xl',
    descriptionSize: 'text-lg'
  },
  xl: {
    width: 'w-[500px]',
    height: 'h-[500px]',
    padding: 'p-10',
    headerPadding: 'p-10 pb-8',
    footerPadding: 'p-10 pt-8',
    titleSize: 'text-3xl',
    descriptionSize: 'text-xl'
  },
  full: {
    width: 'w-full',
    height: 'h-full',
    padding: 'p-12',
    headerPadding: 'p-12 pb-10',
    footerPadding: 'p-12 pt-10',
    titleSize: 'text-4xl',
    descriptionSize: 'text-2xl'
  }
};

// Animation variants
const backdropVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const slideLeftVariants = {
  initial: { 
    opacity: 0, 
    x: '-100%',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
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
    x: '-100%',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const slideRightVariants = {
  initial: { 
    opacity: 0, 
    x: '100%',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
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
    x: '100%',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const slideTopVariants = {
  initial: { 
    opacity: 0, 
    y: '-100%',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
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
    y: '-100%',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const slideBottomVariants = {
  initial: { 
    opacity: 0, 
    y: '100%',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
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
    y: '100%',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassDrawer: React.FC<GlassDrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  variant = 'default',
  size = 'md',
  position = 'right',
  showHeader = true,
  showFooter = true,
  showCloseButton = true,
  showBackdrop = true,
  showOverlay = true,
  showActions = true,
  showTitle = true,
  showDescription = true,
  showIcon = false,
  showProgress = false,
  showResizeHandle = false,
  showDragHandle = false,
  showCollapseButton = false,
  showExpandButton = false,
  allowBackdropClose = true,
  allowEscapeClose = true,
  allowDrag = false,
  allowResize = false,
  allowCollapse = false,
  allowExpand = false,
  isClosable = true,
  isDraggable = false,
  isResizable = false,
  isCollapsible = false,
  isExpandable = false,
  isPersistent = false,
  isOverlay = true,
  className,
  backdropClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  actions = [],
  icon,
  progress,
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  zIndex = 50,
  onOpen,
  onCloseComplete,
  onCollapse,
  onExpand,
  onResize,
  onAction
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [drawerSize, setDrawerSize] = useState({ width: 0, height: 0 });

  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && allowEscapeClose && isClosable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      if (isOverlay) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (isOverlay) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, allowEscapeClose, isClosable, isOverlay, onClose]);

  // Handle drawer open
  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    }
  }, [isOpen, onOpen]);

  // Handle resize start
  const handleResizeStart = (event: React.MouseEvent) => {
    if (!isResizable || !allowResize) return;
    
    event.stopPropagation();
    setIsResizing(true);
    
    const rect = drawerRef.current?.getBoundingClientRect();
    if (rect) {
      setResizeStart({
        x: event.clientX,
        y: event.clientY,
        width: rect.width,
        height: rect.height
      });
    }
  };

  // Handle resize move
  const handleResizeMove = (event: MouseEvent) => {
    if (!isResizing) return;

    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;

    if (position === 'left' || position === 'right') {
      newWidth = resizeStart.width + (event.clientX - resizeStart.x) * (position === 'left' ? -1 : 1);
    } else {
      newHeight = resizeStart.height + (event.clientY - resizeStart.y) * (position === 'top' ? -1 : 1);
    }
    
    setDrawerSize({ width: newWidth, height: newHeight });
    onResize?.(newWidth, newHeight);
  };

  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Add event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === backdropRef.current && allowBackdropClose && isClosable) {
      onClose();
    }
  };

  // Handle collapse
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse?.();
  };

  // Handle expand
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand?.();
  };

  // Handle action click
  const handleActionClick = (action: DrawerAction) => {
    if (action.disabled || action.loading) return;
    action.onClick();
    onAction?.(action.id);
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
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Icon */}
          {showIcon && icon && (
            <div className="flex-shrink-0">
              {React.createElement(icon, { className: "w-6 h-6 text-orange-400" })}
            </div>
          )}

          {/* Title and description */}
          <div className="flex-1 min-w-0">
            {showTitle && title && (
              <h2 className={cn(
                'font-semibold text-white truncate',
                config.titleSize
              )}>
                {title}
              </h2>
            )}
            {showDescription && description && (
              <p className={cn(
                'text-white/80 truncate',
                config.descriptionSize
              )}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center space-x-2">
          {/* Progress */}
          {showProgress && progress !== undefined && (
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-glass-secondary/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-white/60">{Math.round(progress)}%</span>
            </div>
          )}

          {/* Drawer controls */}
          <div className="flex items-center space-x-1">
            {showCollapseButton && isCollapsible && (
              <button
                onClick={handleCollapse}
                className="p-1.5 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
              >
                {isCollapsed ? (
                  position === 'left' ? <ChevronRight className="w-4 h-4" /> :
                  position === 'right' ? <ChevronLeft className="w-4 h-4" /> :
                  position === 'top' ? <ChevronDown className="w-4 h-4" /> :
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  position === 'left' ? <ChevronLeft className="w-4 h-4" /> :
                  position === 'right' ? <ChevronRight className="w-4 h-4" /> :
                  position === 'top' ? <ChevronUp className="w-4 h-4" /> :
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}

            {showExpandButton && isExpandable && (
              <button
                onClick={handleExpand}
                className="p-1.5 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
              >
                {isExpanded ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            )}

            {showCloseButton && isClosable && (
              <button
                onClick={onClose}
                className="p-1.5 text-white/60 hover:text-white hover:bg-red-500/20 rounded transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!showFooter || actions.length === 0) return null;

    return (
      <div className={cn(
        'flex items-center justify-between border-t border-glass-border/50',
        config.footerPadding,
        footerClassName
      )}>
        <div className="flex items-center space-x-2">
          {/* Additional footer content can go here */}
        </div>

        <div className="flex items-center space-x-2">
          {actions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled || action.loading}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200',
                  action.variant === 'primary' && 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30',
                  action.variant === 'secondary' && 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50',
                  action.variant === 'danger' && 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
                  action.variant === 'success' && 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
                  action.variant === 'warning' && 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30',
                  !action.variant && 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50',
                  action.disabled && 'opacity-50 cursor-not-allowed',
                  action.loading && 'opacity-75 cursor-wait'
                )}
              >
                {ActionIcon && <ActionIcon className="w-4 h-4" />}
                <span>{action.label}</span>
                {action.loading && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render resize handle
  const renderResizeHandle = () => {
    if (!showResizeHandle || !isResizable) return null;

    const getResizeHandleClass = () => {
      switch (position) {
        case 'left':
          return 'right-0 top-0 w-1 h-full cursor-ew-resize';
        case 'right':
          return 'left-0 top-0 w-1 h-full cursor-ew-resize';
        case 'top':
          return 'bottom-0 left-0 w-full h-1 cursor-ns-resize';
        case 'bottom':
          return 'top-0 left-0 w-full h-1 cursor-ns-resize';
        default:
          return '';
      }
    };

    return (
      <div
        className={cn(
          'absolute bg-glass-border/50 hover:bg-glass-border/80 transition-colors duration-200',
          getResizeHandleClass()
        )}
        onMouseDown={handleResizeStart}
      />
    );
  };

  // Render drag handle
  const renderDragHandle = () => {
    if (!showDragHandle || !isDraggable) return null;

    const getDragHandleClass = () => {
      switch (position) {
        case 'left':
        case 'right':
          return 'top-4 left-1/2 transform -translate-x-1/2 w-8 h-1 cursor-move';
        case 'top':
        case 'bottom':
          return 'left-4 top-1/2 transform -translate-y-1/2 w-1 h-8 cursor-move';
        default:
          return '';
      }
    };

    return (
      <div
        className={cn(
          'absolute bg-glass-border/50 hover:bg-glass-border/80 rounded transition-colors duration-200',
          getDragHandleClass()
        )}
      />
    );
  };

  // Get drawer styles
  const getDrawerStyles = () => {
    const baseStyles = {
      width: width || (drawerSize.width || undefined),
      height: height || (drawerSize.height || undefined),
      maxWidth: maxWidth || undefined,
      maxHeight: maxHeight || undefined,
      minWidth: minWidth || undefined,
      minHeight: minHeight || undefined
    };

    if (isCollapsed) {
      return {
        ...baseStyles,
        width: position === 'left' || position === 'right' ? '60px' : undefined,
        height: position === 'top' || position === 'bottom' ? '60px' : undefined
      };
    }

    if (isExpanded) {
      return {
        ...baseStyles,
        width: position === 'left' || position === 'right' ? '100vw' : undefined,
        height: position === 'top' || position === 'bottom' ? '100vh' : undefined
      };
    }

    return baseStyles;
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0 top-0 h-full';
      case 'right':
        return 'right-0 top-0 h-full';
      case 'top':
        return 'top-0 left-0 w-full';
      case 'bottom':
        return 'bottom-0 left-0 w-full';
      default:
        return 'right-0 top-0 h-full';
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    if (isCollapsed) {
      return position === 'left' || position === 'right' ? 'w-16' : 'h-16';
    }
    
    if (isExpanded) {
      return position === 'left' || position === 'right' ? 'w-full' : 'h-full';
    }
    
    return cn(
      position === 'left' || position === 'right' ? config.width : 'w-full',
      position === 'top' || position === 'bottom' ? config.height : 'h-full'
    );
  };

  // Get animation variants
  const getAnimationVariants = () => {
    switch (position) {
      case 'left':
        return slideLeftVariants;
      case 'right':
        return slideRightVariants;
      case 'top':
        return slideTopVariants;
      case 'bottom':
        return slideBottomVariants;
      default:
        return slideRightVariants;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence onExitComplete={onCloseComplete}>
      <motion.div
        ref={backdropRef}
        className={cn(
          'fixed inset-0 z-50',
          showBackdrop && 'bg-black/50 backdrop-blur-sm',
          backdropClassName
        )}
        style={{ zIndex }}
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={handleBackdropClick}
      >
        <motion.div
          ref={drawerRef}
          className={cn(
            'absolute bg-glass-primary/90 backdrop-blur-xl',
            'border border-glass-border/50',
            'shadow-glass-lg',
            'overflow-hidden',
            'flex flex-col',
            getPositionClasses(),
            getSizeClasses(),
            className
          )}
          style={getDrawerStyles()}
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Header */}
          {!isCollapsed && renderHeader()}

          {/* Body */}
          {!isCollapsed && (
            <div className={cn(
              'flex-1 overflow-auto',
              config.padding,
              bodyClassName
            )}>
              {children}
            </div>
          )}

          {/* Footer */}
          {!isCollapsed && renderFooter()}

          {/* Resize handle */}
          {renderResizeHandle()}

          {/* Drag handle */}
          {renderDragHandle()}

          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Convenience components
export const GlassDrawerCompact: React.FC<Omit<GlassDrawerProps, 'variant' | 'size'>> = (props) => (
  <GlassDrawer {...props} variant="compact" size="sm" />
);

export const GlassDrawerDetailed: React.FC<Omit<GlassDrawerProps, 'variant' | 'size'>> = (props) => (
  <GlassDrawer {...props} variant="detailed" size="lg" />
);

export const GlassDrawerMinimal: React.FC<Omit<GlassDrawerProps, 'variant'>> = (props) => (
  <GlassDrawer {...props} variant="minimal" showHeader={false} showFooter={false} showCloseButton={false} />
);

export const GlassDrawerFull: React.FC<Omit<GlassDrawerProps, 'variant' | 'size'>> = (props) => (
  <GlassDrawer {...props} variant="detailed" size="full" />
);

// Example usage component
export const GlassDrawerExample: React.FC = () => {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [isTopOpen, setIsTopOpen] = useState(false);
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [isCompactOpen, setIsCompactOpen] = useState(false);
  const [isDetailedOpen, setIsDetailedOpen] = useState(false);

  const sampleActions: DrawerAction[] = [
    {
      id: 'save',
      label: 'Сохранить',
      icon: Save,
      variant: 'primary',
      onClick: () => console.log('Save clicked')
    },
    {
      id: 'cancel',
      label: 'Отмена',
      variant: 'secondary',
      onClick: () => setIsLeftOpen(false)
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Drawer triggers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Выдвижные панели</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setIsLeftOpen(true)}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200"
          >
            Левая панель
          </button>
          <button
            onClick={() => setIsRightOpen(true)}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200"
          >
            Правая панель
          </button>
          <button
            onClick={() => setIsTopOpen(true)}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200"
          >
            Верхняя панель
          </button>
          <button
            onClick={() => setIsBottomOpen(true)}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200"
          >
            Нижняя панель
          </button>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsCompactOpen(true)}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200"
          >
            Компактная панель
          </button>
          <button
            onClick={() => setIsDetailedOpen(true)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200"
          >
            Детальная панель
          </button>
        </div>
      </div>

      {/* Left drawer */}
      <GlassDrawer
        isOpen={isLeftOpen}
        onClose={() => setIsLeftOpen(false)}
        title="Левая панель"
        description="Выдвижная панель слева"
        position="left"
        size="md"
        showHeader
        showFooter
        showCloseButton
        showBackdrop
        showActions
        showTitle
        showDescription
        showIcon
        showProgress
        showResizeHandle
        showDragHandle
        showCollapseButton
        showExpandButton
        allowBackdropClose
        allowEscapeClose
        allowResize
        allowCollapse
        allowExpand
        isClosable
        isResizable
        isCollapsible
        isExpandable
        isOverlay
        actions={sampleActions}
        progress={60}
        onOpen={() => console.log('Left drawer opened')}
        onCollapse={() => console.log('Left drawer collapsed')}
        onExpand={() => console.log('Left drawer expanded')}
        onAction={(actionId) => console.log('Left drawer action:', actionId)}
      >
        <div className="space-y-4">
          <p className="text-white/80">
            Это содержимое левой выдвижной панели. Панель может содержать навигацию, фильтры или дополнительную информацию.
          </p>
          <div className="space-y-2">
            <button className="w-full p-3 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg text-white text-left transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Home className="w-5 h-5 text-orange-400" />
                <span>Главная</span>
              </div>
            </button>
            <button className="w-full p-3 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg text-white text-left transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-400" />
                <span>Профиль</span>
              </div>
            </button>
            <button className="w-full p-3 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg text-white text-left transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-green-400" />
                <span>Настройки</span>
              </div>
            </button>
          </div>
        </div>
      </GlassDrawer>

      {/* Right drawer */}
      <GlassDrawer
        isOpen={isRightOpen}
        onClose={() => setIsRightOpen(false)}
        title="Правая панель"
        description="Выдвижная панель справа"
        position="right"
        size="lg"
        showHeader
        showFooter
        showCloseButton
        showBackdrop
        showActions
        showTitle
        showDescription
        showIcon
        showProgress
        showResizeHandle
        showDragHandle
        showCollapseButton
        showExpandButton
        allowBackdropClose
        allowEscapeClose
        allowResize
        allowCollapse
        allowExpand
        isClosable
        isResizable
        isCollapsible
        isExpandable
        isOverlay
        actions={sampleActions}
        progress={80}
        onOpen={() => console.log('Right drawer opened')}
        onCollapse={() => console.log('Right drawer collapsed')}
        onExpand={() => console.log('Right drawer expanded')}
        onAction={(actionId) => console.log('Right drawer action:', actionId)}
      >
        <div className="space-y-6">
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Информация</h4>
            <p className="text-white/70 text-sm">
              Правая панель идеально подходит для отображения дополнительной информации, деталей или форм.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Статус</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Активен</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Версия</span>
              <span className="text-white/60">2.4.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Последнее обновление</span>
              <span className="text-white/60">15.01.2024</span>
            </div>
          </div>
        </div>
      </GlassDrawer>

      {/* Top drawer */}
      <GlassDrawer
        isOpen={isTopOpen}
        onClose={() => setIsTopOpen(false)}
        title="Верхняя панель"
        description="Выдвижная панель сверху"
        position="top"
        size="md"
        showHeader
        showFooter
        showCloseButton
        showBackdrop
        showActions
        showTitle
        showDescription
        showIcon
        showProgress
        showResizeHandle
        showDragHandle
        showCollapseButton
        showExpandButton
        allowBackdropClose
        allowEscapeClose
        allowResize
        allowCollapse
        allowExpand
        isClosable
        isResizable
        isCollapsible
        isExpandable
        isOverlay
        actions={sampleActions}
        progress={40}
        onOpen={() => console.log('Top drawer opened')}
        onCollapse={() => console.log('Top drawer collapsed')}
        onExpand={() => console.log('Top drawer expanded')}
        onAction={(actionId) => console.log('Top drawer action:', actionId)}
      >
        <div className="space-y-4">
          <p className="text-white/80">
            Верхняя панель может использоваться для уведомлений, поиска или быстрого доступа к функциям.
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full px-4 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              />
            </div>
            <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassDrawer>

      {/* Bottom drawer */}
      <GlassDrawer
        isOpen={isBottomOpen}
        onClose={() => setIsBottomOpen(false)}
        title="Нижняя панель"
        description="Выдвижная панель снизу"
        position="bottom"
        size="md"
        showHeader
        showFooter
        showCloseButton
        showBackdrop
        showActions
        showTitle
        showDescription
        showIcon
        showProgress
        showResizeHandle
        showDragHandle
        showCollapseButton
        showExpandButton
        allowBackdropClose
        allowEscapeClose
        allowResize
        allowCollapse
        allowExpand
        isClosable
        isResizable
        isCollapsible
        isExpandable
        isOverlay
        actions={sampleActions}
        progress={90}
        onOpen={() => console.log('Bottom drawer opened')}
        onCollapse={() => console.log('Bottom drawer collapsed')}
        onExpand={() => console.log('Bottom drawer expanded')}
        onAction={(actionId) => console.log('Bottom drawer action:', actionId)}
      >
        <div className="space-y-4">
          <p className="text-white/80">
            Нижняя панель подходит для отображения дополнительных инструментов, клавиатуры или медиа-контролов.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button className="p-3 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg text-white transition-colors duration-200">
              <Play className="w-5 h-5" />
            </button>
            <button className="p-3 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg text-white transition-colors duration-200">
              <Pause className="w-5 h-5" />
            </button>
            <button className="p-3 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg text-white transition-colors duration-200">
              <SkipBack className="w-5 h-5" />
            </button>
            <button className="p-3 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg text-white transition-colors duration-200">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </GlassDrawer>

      {/* Compact drawer */}
      <GlassDrawerCompact
        isOpen={isCompactOpen}
        onClose={() => setIsCompactOpen(false)}
        title="Компактная панель"
        description="Небольшая выдвижная панель"
        position="right"
        showHeader
        showFooter
        showCloseButton
        showBackdrop
        showActions
        showTitle
        showDescription
        actions={[
          {
            id: 'ok',
            label: 'OK',
            variant: 'primary',
            onClick: () => setIsCompactOpen(false)
          }
        ]}
        onOpen={() => console.log('Compact drawer opened')}
        onAction={(actionId) => console.log('Compact drawer action:', actionId)}
      >
        <p className="text-white/80">Компактная выдвижная панель для простых уведомлений и быстрых действий.</p>
      </GlassDrawerCompact>

      {/* Detailed drawer */}
      <GlassDrawerDetailed
        isOpen={isDetailedOpen}
        onClose={() => setIsDetailedOpen(false)}
        title="Детальная панель"
        description="Большая выдвижная панель с подробной информацией"
        position="right"
        showHeader
        showFooter
        showCloseButton
        showBackdrop
        showActions
        showTitle
        showDescription
        showIcon
        showProgress
        showResizeHandle
        showDragHandle
        showCollapseButton
        showExpandButton
        allowBackdropClose
        allowEscapeClose
        allowResize
        allowCollapse
        allowExpand
        isClosable
        isResizable
        isCollapsible
        isExpandable
        isOverlay
        actions={sampleActions}
        progress={70}
        onOpen={() => console.log('Detailed drawer opened')}
        onCollapse={() => console.log('Detailed drawer collapsed')}
        onExpand={() => console.log('Detailed drawer expanded')}
        onAction={(actionId) => console.log('Detailed drawer action:', actionId)}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-glass-secondary/20 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Статистика</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Просмотры</span>
                  <span className="text-white">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Лайки</span>
                  <span className="text-white">567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Комментарии</span>
                  <span className="text-white">89</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-glass-secondary/20 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Настройки</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="w-4 h-4 text-orange-500 bg-glass-secondary/30 border-glass-border/50 rounded focus:ring-orange-400/50" />
                  <span className="text-sm text-white/80">Уведомления</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="w-4 h-4 text-orange-500 bg-glass-secondary/30 border-glass-border/50 rounded focus:ring-orange-400/50" />
                  <span className="text-sm text-white/80">Автосохранение</span>
                </label>
              </div>
            </div>
          </div>
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Дополнительная информация</h4>
            <p className="text-white/70 text-sm">
              Детальная выдвижная панель может содержать много контента, включая формы, таблицы, графики и другие сложные элементы интерфейса.
            </p>
          </div>
        </div>
      </GlassDrawerDetailed>
    </div>
  );
};

