'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  X, 
  Minimize, 
  Maximize, 
  Move, 
  RotateCcw,
  Save,
  Download,
  Share2,
  Edit,
  Trash2,
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
  HelpCircle
} from 'lucide-react';

export interface ModalAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'fullscreen';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
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
  showResize?: boolean;
  showMove?: boolean;
  showMinimize?: boolean;
  showMaximize?: boolean;
  allowBackdropClose?: boolean;
  allowEscapeClose?: boolean;
  allowDrag?: boolean;
  allowResize?: boolean;
  allowMinimize?: boolean;
  allowMaximize?: boolean;
  allowFullscreen?: boolean;
  isClosable?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  isMinimizable?: boolean;
  isMaximizable?: boolean;
  isFullscreenable?: boolean;
  isCentered?: boolean;
  isScrollable?: boolean;
  isPersistent?: boolean;
  className?: string;
  backdropClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  actions?: ModalAction[];
  icon?: React.ComponentType<{ className?: string }>;
  progress?: number;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  zIndex?: number;
  onOpen?: () => void;
  onCloseComplete?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onResize?: (width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
  onAction?: (actionId: string) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    width: 'w-96',
    height: 'h-auto',
    maxWidth: 'max-w-md',
    padding: 'p-4',
    headerPadding: 'p-4 pb-2',
    footerPadding: 'p-4 pt-2',
    titleSize: 'text-lg',
    descriptionSize: 'text-sm'
  },
  md: {
    width: 'w-[500px]',
    height: 'h-auto',
    maxWidth: 'max-w-lg',
    padding: 'p-6',
    headerPadding: 'p-6 pb-4',
    footerPadding: 'p-6 pt-4',
    titleSize: 'text-xl',
    descriptionSize: 'text-base'
  },
  lg: {
    width: 'w-[700px]',
    height: 'h-auto',
    maxWidth: 'max-w-2xl',
    padding: 'p-8',
    headerPadding: 'p-8 pb-6',
    footerPadding: 'p-8 pt-6',
    titleSize: 'text-2xl',
    descriptionSize: 'text-lg'
  },
  xl: {
    width: 'w-[900px]',
    height: 'h-auto',
    maxWidth: 'max-w-4xl',
    padding: 'p-10',
    headerPadding: 'p-10 pb-8',
    footerPadding: 'p-10 pt-8',
    titleSize: 'text-3xl',
    descriptionSize: 'text-xl'
  },
  full: {
    width: 'w-full',
    height: 'h-full',
    maxWidth: 'max-w-none',
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

const modalVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const slideVariants = {
  initial: { 
    opacity: 0, 
    x: -300,
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
    x: -300,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  variant = 'default',
  size = 'md',
  position = 'center',
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
  showResize = false,
  showMove = false,
  showMinimize = false,
  showMaximize = false,
  allowBackdropClose = true,
  allowEscapeClose = true,
  allowDrag = false,
  allowResize = false,
  allowMinimize = false,
  allowMaximize = false,
  allowFullscreen = false,
  isClosable = true,
  isDraggable = false,
  isResizable = false,
  isMinimizable = false,
  isMaximizable = false,
  isFullscreenable = false,
  isCentered = true,
  isScrollable = true,
  isPersistent = false,
  className,
  backdropClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  actions = [],
  icon,
  progress,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  zIndex = 50,
  onOpen,
  onCloseComplete,
  onMinimize,
  onMaximize,
  onResize,
  onMove,
  onAction
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [modalSize, setModalSize] = useState({ width: 0, height: 0 });

  const modalRef = useRef<HTMLDivElement>(null);
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
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, allowEscapeClose, isClosable, onClose]);

  // Handle modal open
  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    }
  }, [isOpen, onOpen]);

  // Handle drag start
  const handleDragStart = (event: React.MouseEvent) => {
    if (!isDraggable || !allowDrag) return;
    
    setIsDragging(true);
    setDragStart({
      x: event.clientX - dragPosition.x,
      y: event.clientY - dragPosition.y
    });
  };

  // Handle drag move
  const handleDragMove = (event: MouseEvent) => {
    if (!isDragging) return;

    const newX = event.clientX - dragStart.x;
    const newY = event.clientY - dragStart.y;
    
    setDragPosition({ x: newX, y: newY });
    onMove?.(newX, newY);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle resize start
  const handleResizeStart = (event: React.MouseEvent) => {
    if (!isResizable || !allowResize) return;
    
    event.stopPropagation();
    setIsResizing(true);
    
    const rect = modalRef.current?.getBoundingClientRect();
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

    const newWidth = resizeStart.width + (event.clientX - resizeStart.x);
    const newHeight = resizeStart.height + (event.clientY - resizeStart.y);
    
    setModalSize({ width: newWidth, height: newHeight });
    onResize?.(newWidth, newHeight);
  };

  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Add event listeners for drag and resize
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isDragging, isResizing]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === backdropRef.current && allowBackdropClose && isClosable) {
      onClose();
    }
  };

  // Handle minimize
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize?.();
  };

  // Handle maximize
  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximize?.();
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle action click
  const handleActionClick = (action: ModalAction) => {
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
              <icon className="w-6 h-6 text-orange-400" />
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

          {/* Window controls */}
          <div className="flex items-center space-x-1">
            {showMinimize && isMinimizable && (
              <button
                onClick={handleMinimize}
                className="p-1.5 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
              >
                <Minimize className="w-4 h-4" />
              </button>
            )}

            {showMaximize && isMaximizable && (
              <button
                onClick={handleMaximize}
                className="p-1.5 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
              >
                <Maximize className="w-4 h-4" />
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
    if (!showResize || !isResizable) return null;

    return (
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white/40" />
      </div>
    );
  };

  // Get modal styles
  const getModalStyles = () => {
    const baseStyles = {
      width: modalSize.width || undefined,
      height: modalSize.height || undefined,
      maxWidth: maxWidth || undefined,
      maxHeight: maxHeight || undefined,
      minWidth: minWidth || undefined,
      minHeight: minHeight || undefined,
      transform: isDragging ? `translate(${dragPosition.x}px, ${dragPosition.y}px)` : undefined
    };

    if (isFullscreen || size === 'full') {
      return {
        ...baseStyles,
        width: '100vw',
        height: '100vh',
        maxWidth: 'none',
        maxHeight: 'none'
      };
    }

    return baseStyles;
  };

  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'items-start justify-center pt-8';
      case 'bottom':
        return 'items-end justify-center pb-8';
      case 'left':
        return 'items-center justify-start pl-8';
      case 'right':
        return 'items-center justify-end pr-8';
      default:
        return 'items-center justify-center';
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    if (isFullscreen || size === 'full') {
      return 'w-full h-full max-w-none max-h-none';
    }
    return cn(config.width, config.height, config.maxWidth);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence onExitComplete={onCloseComplete}>
      <motion.div
        ref={backdropRef}
        className={cn(
          'fixed inset-0 z-50 flex',
          getPositionStyles(),
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
          ref={modalRef}
          className={cn(
            'relative bg-glass-primary/90 backdrop-blur-xl',
            'border border-glass-border/50',
            'rounded-2xl shadow-glass-lg',
            'overflow-hidden',
            'flex flex-col',
            getSizeClasses(),
            isScrollable && 'max-h-[90vh]',
            isDraggable && 'cursor-move',
            className
          )}
          style={getModalStyles()}
          variants={position === 'left' || position === 'right' ? slideVariants : modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onMouseDown={handleDragStart}
        >
          {/* Header */}
          {renderHeader()}

          {/* Body */}
          <div className={cn(
            'flex-1 overflow-auto',
            config.padding,
            bodyClassName
          )}>
            {children}
          </div>

          {/* Footer */}
          {renderFooter()}

          {/* Resize handle */}
          {renderResizeHandle()}

          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Convenience components
export const GlassModalCompact: React.FC<Omit<GlassModalProps, 'variant' | 'size'>> = (props) => (
  <GlassModal {...props} variant="compact" size="sm" />
);

export const GlassModalDetailed: React.FC<Omit<GlassModalProps, 'variant' | 'size'>> = (props) => (
  <GlassModal {...props} variant="detailed" size="lg" />
);

export const GlassModalMinimal: React.FC<Omit<GlassModalProps, 'variant'>> = (props) => (
  <GlassModal {...props} variant="minimal" showHeader={false} showFooter={false} showCloseButton={false} />
);

export const GlassModalFullscreen: React.FC<Omit<GlassModalProps, 'variant' | 'size'>> = (props) => (
  <GlassModal {...props} variant="fullscreen" size="full" />
);

// Example usage component
export const GlassModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompactOpen, setIsCompactOpen] = useState(false);
  const [isDetailedOpen, setIsDetailedOpen] = useState(false);
  const [isMinimalOpen, setIsMinimalOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const sampleActions: ModalAction[] = [
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
      onClick: () => setIsOpen(false)
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: Trash2,
      variant: 'danger',
      onClick: () => console.log('Delete clicked')
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Modal triggers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Модальные окна</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200"
          >
            Открыть модальное окно
          </button>
          <button
            onClick={() => setIsCompactOpen(true)}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200"
          >
            Компактное модальное окно
          </button>
          <button
            onClick={() => setIsDetailedOpen(true)}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200"
          >
            Детальное модальное окно
          </button>
          <button
            onClick={() => setIsMinimalOpen(true)}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200"
          >
            Минимальное модальное окно
          </button>
          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200"
          >
            Полноэкранное модальное окно
          </button>
        </div>
      </div>

      {/* Default modal */}
      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Заголовок модального окна"
        description="Описание модального окна с дополнительной информацией"
        icon={Settings}
        showHeader
        showFooter
        showCloseButton
        showBackdrop
        showActions
        showTitle
        showDescription
        showIcon
        showProgress
        allowBackdropClose
        allowEscapeClose
        isClosable
        isCentered
        isScrollable
        actions={sampleActions}
        progress={75}
        onOpen={() => console.log('Modal opened')}
        onClose={() => console.log('Modal closed')}
        onAction={(actionId) => console.log('Action clicked:', actionId)}
      >
        <div className="space-y-4">
          <p className="text-white/80">
            Это содержимое модального окна. Здесь может быть любой контент - формы, изображения, текст и т.д.
          </p>
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Пример контента</h4>
            <p className="text-white/70 text-sm">
              Модальное окно поддерживает различные размеры, позиции и варианты отображения.
            </p>
          </div>
        </div>
      </GlassModal>

      {/* Compact modal */}
      <GlassModalCompact
        isOpen={isCompactOpen}
        onClose={() => setIsCompactOpen(false)}
        title="Компактное окно"
        description="Небольшое модальное окно"
        actions={[
          {
            id: 'ok',
            label: 'OK',
            variant: 'primary',
            onClick: () => setIsCompactOpen(false)
          }
        ]}
      >
        <p className="text-white/80">Компактное модальное окно для простых уведомлений.</p>
      </GlassModalCompact>

      {/* Detailed modal */}
      <GlassModalDetailed
        isOpen={isDetailedOpen}
        onClose={() => setIsDetailedOpen(false)}
        title="Детальное модальное окно"
        description="Большое модальное окно с подробной информацией"
        icon={Info}
        showProgress
        progress={50}
        actions={sampleActions}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-glass-secondary/20 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Секция 1</h4>
              <p className="text-white/70 text-sm">Содержимое первой секции</p>
            </div>
            <div className="p-4 bg-glass-secondary/20 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Секция 2</h4>
              <p className="text-white/70 text-sm">Содержимое второй секции</p>
            </div>
          </div>
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Дополнительная информация</h4>
            <p className="text-white/70 text-sm">
              Детальное модальное окно может содержать много контента и поддерживает прокрутку.
            </p>
          </div>
        </div>
      </GlassModalDetailed>

      {/* Minimal modal */}
      <GlassModalMinimal
        isOpen={isMinimalOpen}
        onClose={() => setIsMinimalOpen(false)}
        allowBackdropClose
        allowEscapeClose
      >
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-white mb-2">Минимальное окно</h3>
          <p className="text-white/80 mb-4">Простое модальное окно без заголовка и футера</p>
          <button
            onClick={() => setIsMinimalOpen(false)}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200"
          >
            Закрыть
          </button>
        </div>
      </GlassModalMinimal>

      {/* Fullscreen modal */}
      <GlassModalFullscreen
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        title="Полноэкранное модальное окно"
        description="Модальное окно на весь экран"
        icon={Maximize}
        showHeader
        showFooter
        showCloseButton
        actions={[
          {
            id: 'close',
            label: 'Закрыть',
            variant: 'primary',
            onClick: () => setIsFullscreenOpen(false)
          }
        ]}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">Полноэкранный режим</h3>
            <p className="text-white/80 text-lg">
              Это модальное окно занимает весь экран и идеально подходит для сложных интерфейсов.
            </p>
          </div>
        </div>
      </GlassModalFullscreen>
    </div>
  );
};