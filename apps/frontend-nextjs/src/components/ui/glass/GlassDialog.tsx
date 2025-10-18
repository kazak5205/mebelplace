'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  X, 
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  Shield,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Save,
  Download,
  Upload,
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
  Copy,
  ExternalLink,
  RefreshCw,
  Loader,
  Check,
  XCircle,
  AlertTriangle,
  Info as InfoIcon,
  HelpCircle as HelpIcon,
  Lightbulb,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
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
  Mail,
  Phone,
  MessageCircle,
  Users,
  Send,
  Reply,
  Forward,
  Link,
  Unlink,
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
  ShieldMinus
} from 'lucide-react';

export interface DialogAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
}

export interface GlassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'alert' | 'confirm' | 'prompt' | 'form';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  type?: 'info' | 'success' | 'warning' | 'error' | 'question' | 'custom';
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
  allowBackdropClose?: boolean;
  allowEscapeClose?: boolean;
  isClosable?: boolean;
  isCentered?: boolean;
  isScrollable?: boolean;
  isPersistent?: boolean;
  className?: string;
  backdropClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  actions?: DialogAction[];
  icon?: React.ComponentType<{ className?: string }>;
  progress?: number;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  zIndex?: number;
  onOpen?: () => void;
  onCloseComplete?: () => void;
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

// Type configurations
const typeConfig = {
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  },
  question: {
    icon: HelpCircle,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  custom: {
    icon: Settings,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
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

const dialogVariants = {
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

export const GlassDialog: React.FC<GlassDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  variant = 'default',
  size = 'md',
  type = 'custom',
  showHeader = true,
  showFooter = true,
  showCloseButton = true,
  showBackdrop = true,
  showOverlay = true,
  showActions = true,
  showTitle = true,
  showDescription = true,
  showIcon = true,
  showProgress = false,
  allowBackdropClose = true,
  allowEscapeClose = true,
  isClosable = true,
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
  onAction
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];
  const typeStyle = typeConfig[type];

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

  // Handle dialog open
  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    }
  }, [isOpen, onOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === backdropRef.current && allowBackdropClose && isClosable) {
      onClose();
    }
  };

  // Handle action click
  const handleActionClick = (action: DialogAction) => {
    if (action.disabled || action.loading) return;
    action.onClick();
    onAction?.(action.id);
  };

  // Get dialog icon
  const getDialogIcon = () => {
    if (icon) return icon;
    return typeStyle.icon;
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;

    const DialogIcon = getDialogIcon();

    return (
      <div className={cn(
        'flex items-center space-x-4',
        config.headerPadding,
        headerClassName
      )}>
        {/* Icon */}
        {showIcon && DialogIcon && (
          <div className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
            typeStyle.iconBg
          )}>
            <DialogIcon className={cn('w-6 h-6', typeStyle.iconColor)} />
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

        {/* Close button */}
        {showCloseButton && isClosable && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!showFooter || actions.length === 0) return null;

    return (
      <div className={cn(
        'flex items-center justify-end space-x-3',
        config.footerPadding,
        footerClassName
      )}>
        {actions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled || action.loading}
              autoFocus={action.autoFocus}
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
    );
  };

  // Render progress
  const renderProgress = () => {
    if (!showProgress || progress === undefined) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Прогресс</span>
          <span className="text-sm text-white/60">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-glass-secondary/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  // Get size classes
  const getSizeClasses = () => {
    if (size === 'full') {
      return 'w-full h-full max-w-none max-h-none';
    }
    return cn(config.width, config.height, config.maxWidth);
  };

  // Get border classes
  const getBorderClasses = () => {
    return cn(
      'border border-glass-border/50',
      typeStyle.borderColor
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence onExitComplete={onCloseComplete}>
      <motion.div
        ref={backdropRef}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
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
          ref={dialogRef}
          className={cn(
            'relative bg-glass-primary/90 backdrop-blur-xl',
            getBorderClasses(),
            'rounded-2xl shadow-glass-lg',
            'overflow-hidden',
            'flex flex-col',
            getSizeClasses(),
            isScrollable && 'max-h-[90vh]',
            className
          )}
          style={{
            maxWidth: maxWidth || undefined,
            maxHeight: maxHeight || undefined,
            minWidth: minWidth || undefined,
            minHeight: minHeight || undefined
          }}
          variants={dialogVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {renderHeader()}

          {/* Body */}
          <div className={cn(
            'flex-1 overflow-auto',
            config.padding,
            bodyClassName
          )}>
            {/* Progress */}
            {renderProgress()}

            {/* Content */}
            {children}
          </div>

          {/* Footer */}
          {renderFooter()}

          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Convenience components
export const GlassDialogCompact: React.FC<Omit<GlassDialogProps, 'variant' | 'size'>> = (props) => (
  <GlassDialog {...props} variant="compact" size="sm" />
);

export const GlassDialogDetailed: React.FC<Omit<GlassDialogProps, 'variant' | 'size'>> = (props) => (
  <GlassDialog {...props} variant="detailed" size="lg" />
);

export const GlassDialogMinimal: React.FC<Omit<GlassDialogProps, 'variant'>> = (props) => (
  <GlassDialog {...props} variant="minimal" />
);

export const GlassAlert: React.FC<Omit<GlassDialogProps, 'variant' | 'type'>> = (props) => (
  <GlassDialog {...props} variant="alert" />
);

export const GlassConfirm: React.FC<Omit<GlassDialogProps, 'variant' | 'type'>> = (props) => (
  <GlassDialog {...props} variant="confirm" />
);

export const GlassPrompt: React.FC<Omit<GlassDialogProps, 'variant' | 'type'>> = (props) => (
  <GlassDialog {...props} variant="prompt" />
);

export const GlassFormDialog: React.FC<Omit<GlassDialogProps, 'variant' | 'type'>> = (props) => (
  <GlassDialog {...props} variant="form" />
);

// Example usage component
