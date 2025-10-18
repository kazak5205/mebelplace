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
  AlertTriangle,
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
  RotateCcw,
  Loader,
  Check,
  XCircle,
  AlertTriangle as Warning,
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
  Trash
} from 'lucide-react';

export interface AlertAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface GlassAlertProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'banner' | 'toast';
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center' | 'inline';
  showHeader?: boolean;
  showFooter?: boolean;
  showCloseButton?: boolean;
  showIcon?: boolean;
  showActions?: boolean;
  showProgress?: boolean;
  showCountdown?: boolean;
  allowDismiss?: boolean;
  allowAutoDismiss?: boolean;
  allowClickOutside?: boolean;
  allowEscapeClose?: boolean;
  isClosable?: boolean;
  isPersistent?: boolean;
  isSticky?: boolean;
  isExpandable?: boolean;
  isCollapsible?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  actions?: AlertAction[];
  icon?: React.ComponentType<{ className?: string }>;
  progress?: number;
  countdown?: number;
  autoDismissDelay?: number;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  zIndex?: number;
  onOpen?: () => void;
  onCloseComplete?: () => void;
  onAction?: (actionId: string) => void;
  onExpand?: () => void;
  onCollapse?: () => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    width: 'w-80',
    height: 'h-auto',
    maxWidth: 'max-w-sm',
    padding: 'p-3',
    headerPadding: 'p-3 pb-2',
    footerPadding: 'p-3 pt-2',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs',
    iconSize: 'w-5 h-5'
  },
  md: {
    width: 'w-96',
    height: 'h-auto',
    maxWidth: 'max-w-md',
    padding: 'p-4',
    headerPadding: 'p-4 pb-3',
    footerPadding: 'p-4 pt-3',
    titleSize: 'text-base',
    descriptionSize: 'text-sm',
    iconSize: 'w-6 h-6'
  },
  lg: {
    width: 'w-[500px]',
    height: 'h-auto',
    maxWidth: 'max-w-lg',
    padding: 'p-6',
    headerPadding: 'p-6 pb-4',
    footerPadding: 'p-6 pt-4',
    titleSize: 'text-lg',
    descriptionSize: 'text-base',
    iconSize: 'w-8 h-8'
  },
  xl: {
    width: 'w-[600px]',
    height: 'h-auto',
    maxWidth: 'max-w-xl',
    padding: 'p-8',
    headerPadding: 'p-8 pb-6',
    footerPadding: 'p-8 pt-6',
    titleSize: 'text-xl',
    descriptionSize: 'text-lg',
    iconSize: 'w-10 h-10'
  },
  auto: {
    width: 'w-auto',
    height: 'h-auto',
    maxWidth: 'max-w-none',
    padding: 'p-4',
    headerPadding: 'p-4 pb-3',
    footerPadding: 'p-4 pt-3',
    titleSize: 'text-base',
    descriptionSize: 'text-sm',
    iconSize: 'w-6 h-6'
  }
};

// Type configurations
const typeConfig = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/10'
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/10'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/10'
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10'
  },
  loading: {
    icon: Loader,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/10'
  },
  custom: {
    icon: Settings,
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    bgColor: 'bg-gray-500/10'
  }
};

// Position configurations
const positionConfig = {
  'top-left': 'fixed top-4 left-4',
  'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2',
  'top-right': 'fixed top-4 right-4',
  'bottom-left': 'fixed bottom-4 left-4',
  'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
  'bottom-right': 'fixed bottom-4 right-4',
  'center': 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  'inline': 'relative'
};

// Animation variants
const alertVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: -20
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
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const slideVariants = {
  'top-left': {
    initial: { opacity: 0, x: -100, y: -20 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: -100, y: -20 }
  },
  'top-center': {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 }
  },
  'top-right': {
    initial: { opacity: 0, x: 100, y: -20 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 100, y: -20 }
  },
  'bottom-left': {
    initial: { opacity: 0, x: -100, y: 20 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: -100, y: 20 }
  },
  'bottom-center': {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 }
  },
  'bottom-right': {
    initial: { opacity: 0, x: 100, y: 20 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 100, y: 20 }
  },
  'center': {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  'inline': {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  }
};

export const GlassAlert: React.FC<GlassAlertProps> = ({
  isVisible,
  onClose,
  title,
  description,
  children,
  variant = 'default',
  type = 'info',
  size = 'md',
  position = 'top-right',
  showHeader = true,
  showFooter = true,
  showCloseButton = true,
  showIcon = true,
  showActions = true,
  showProgress = false,
  showCountdown = false,
  allowDismiss = true,
  allowAutoDismiss = true,
  allowClickOutside = true,
  allowEscapeClose = true,
  isClosable = true,
  isPersistent = false,
  isSticky = false,
  isExpandable = false,
  isCollapsible = false,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  actions = [],
  icon,
  progress,
  countdown,
  autoDismissDelay = 5000,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  zIndex = 50,
  onOpen,
  onCloseComplete,
  onAction,
  onExpand,
  onCollapse
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentCountdown, setCurrentCountdown] = useState(countdown || 0);
  const [autoDismissTimeout, setAutoDismissTimeout] = useState<NodeJS.Timeout | null>(null);

  const alertRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];
  const typeStyle = typeConfig[type];
  const positionStyle = positionConfig[position];

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && allowEscapeClose && isClosable && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, allowEscapeClose, isClosable, onClose]);

  // Handle alert open
  useEffect(() => {
    if (isVisible) {
      onOpen?.();
      
      // Start auto dismiss timer
      if (allowAutoDismiss && autoDismissDelay > 0) {
        const timeout = setTimeout(() => {
          onClose();
        }, autoDismissDelay);
        setAutoDismissTimeout(timeout);
      }

      // Start countdown timer
      if (showCountdown && countdown && countdown > 0) {
        setCurrentCountdown(countdown);
        const countdownInterval = setInterval(() => {
          setCurrentCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              if (allowAutoDismiss) {
                onClose();
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (autoDismissTimeout) {
        clearTimeout(autoDismissTimeout);
        setAutoDismissTimeout(null);
      }
    };
  }, [isVisible, allowAutoDismiss, autoDismissDelay, showCountdown, countdown, onClose, onOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isVisible &&
        allowClickOutside &&
        alertRef.current &&
        !alertRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, allowClickOutside, onClose]);

  // Handle expand
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand?.();
  };

  // Handle collapse
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse?.();
  };

  // Handle action click
  const handleActionClick = (action: AlertAction) => {
    if (action.disabled || action.loading) return;
    action.onClick();
    onAction?.(action.id);
  };

  // Get alert icon
  const getAlertIcon = () => {
    if (icon) return icon;
    return typeStyle.icon;
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;

    const AlertIcon = getAlertIcon();

    return (
      <div className={cn(
        'flex items-center space-x-3',
        config.headerPadding,
        headerClassName
      )}>
        {/* Icon */}
        {showIcon && AlertIcon && (
          <div className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            typeStyle.iconBg
          )}>
            <AlertIcon className={cn(
              config.iconSize,
              typeStyle.iconColor,
              type === 'loading' && 'animate-spin'
            )} />
          </div>
        )}

        {/* Title and description */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn(
              'font-semibold text-white truncate',
              config.titleSize
            )}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn(
              'text-white/80 truncate',
              config.descriptionSize
            )}>
              {description}
            </p>
          )}
        </div>

        {/* Header actions */}
        <div className="flex items-center space-x-2">
          {/* Countdown */}
          {showCountdown && currentCountdown > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-8 h-8 bg-glass-secondary/30 rounded-full flex items-center justify-center">
                <span className="text-xs text-white/80">{currentCountdown}</span>
              </div>
            </div>
          )}

          {/* Expand/Collapse */}
          {isExpandable && (
            <button
              onClick={handleExpand}
              className="p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
            >
              {isExpanded ? (
                <Minus className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Close button */}
          {showCloseButton && isClosable && (
            <button
              onClick={onClose}
              className="p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!showFooter || actions.length === 0) return null;

    return (
      <div className={cn(
        'flex items-center justify-end space-x-2',
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
              className={cn(
                'flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm',
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
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/60">Прогресс</span>
          <span className="text-xs text-white/60">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-glass-secondary/30 rounded-full overflow-hidden">
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
    if (size === 'auto') {
      return 'w-auto';
    }
    return cn(config.width, config.height, config.maxWidth);
  };

  // Get animation variants
  const getAnimationVariants = () => {
    return slideVariants[position] || alertVariants;
  };

  // Get border classes
  const getBorderClasses = () => {
    return cn(
      'border border-glass-border/50',
      typeStyle.borderColor
    );
  };

  // Get background classes
  const getBackgroundClasses = () => {
    return cn(
      'bg-glass-primary/90 backdrop-blur-xl',
      typeStyle.bgColor
    );
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence onExitComplete={onCloseComplete}>
      <motion.div
        ref={alertRef}
        className={cn(
          positionStyle,
          getBackgroundClasses(),
          getBorderClasses(),
          'rounded-xl shadow-glass-lg',
          'overflow-hidden',
          'flex flex-col',
          getSizeClasses(),
          isSticky && 'sticky',
          className
        )}
        style={{
          maxWidth: maxWidth || undefined,
          maxHeight: maxHeight || undefined,
          minWidth: minWidth || undefined,
          minHeight: minHeight || undefined,
          zIndex
        }}
        variants={getAnimationVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        {renderHeader()}

        {/* Body */}
        {!isCollapsed && (
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
        )}

        {/* Footer */}
        {!isCollapsed && renderFooter()}

        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
};

// Convenience components
export const GlassAlertCompact: React.FC<Omit<GlassAlertProps, 'variant' | 'size'>> = (props) => (
  <GlassAlert {...props} variant="compact" size="sm" />
);

export const GlassAlertDetailed: React.FC<Omit<GlassAlertProps, 'variant' | 'size'>> = (props) => (
  <GlassAlert {...props} variant="detailed" size="lg" />
);

export const GlassAlertMinimal: React.FC<Omit<GlassAlertProps, 'variant'>> = (props) => (
  <GlassAlert {...props} variant="minimal" showHeader={false} showFooter={false} showCloseButton={false} />
);

export const GlassAlertBanner: React.FC<Omit<GlassAlertProps, 'variant' | 'position'>> = (props) => (
  <GlassAlert {...props} variant="banner" position="top-center" />
);

export const GlassAlertToast: React.FC<Omit<GlassAlertProps, 'variant' | 'position'>> = (props) => (
  <GlassAlert {...props} variant="toast" position="bottom-right" />
);

// Example usage component
export const GlassAlertExample: React.FC = () => {
  const [isDefaultVisible, setIsDefaultVisible] = useState(false);
  const [isCompactVisible, setIsCompactVisible] = useState(false);
  const [isDetailedVisible, setIsDetailedVisible] = useState(false);
  const [isMinimalVisible, setIsMinimalVisible] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const sampleActions: AlertAction[] = [
    {
      id: 'retry',
      label: 'Повторить',
      icon: RefreshCw,
      variant: 'primary',
      onClick: () => console.log('Retry clicked')
    },
    {
      id: 'dismiss',
      label: 'Закрыть',
      variant: 'secondary',
      onClick: () => setIsDefaultVisible(false)
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Alert triggers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Уведомления</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsDefaultVisible(true)}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200"
          >
            Обычное уведомление
          </button>
          <button
            onClick={() => setIsCompactVisible(true)}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200"
          >
            Компактное уведомление
          </button>
          <button
            onClick={() => setIsDetailedVisible(true)}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200"
          >
            Детальное уведомление
          </button>
          <button
            onClick={() => setIsMinimalVisible(true)}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200"
          >
            Минимальное уведомление
          </button>
          <button
            onClick={() => setIsBannerVisible(true)}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200"
          >
            Баннер
          </button>
          <button
            onClick={() => setIsToastVisible(true)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200"
          >
            Toast
          </button>
        </div>
      </div>

      {/* Default alert */}
      <GlassAlert
        isVisible={isDefaultVisible}
        onClose={() => setIsDefaultVisible(false)}
        title="Уведомление"
        description="Это обычное уведомление с дополнительной информацией"
        type="info"
        size="md"
        position="top-right"
        showHeader
        showFooter
        showCloseButton
        showIcon
        showActions
        allowDismiss
        allowAutoDismiss
        allowClickOutside
        allowEscapeClose
        isClosable
        actions={sampleActions}
        autoDismissDelay={5000}
        onOpen={() => console.log('Default alert opened')}
        onAction={(actionId) => console.log('Default alert action:', actionId)}
      >
        <div className="space-y-3">
          <p className="text-white/80 text-sm">
            Это содержимое обычного уведомления. Здесь может быть любой контент - текст, изображения, формы и т.д.
          </p>
          <div className="p-3 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-1">Пример контента</h4>
            <p className="text-white/70 text-xs">
              Уведомление поддерживает различные размеры, типы и позиции отображения.
            </p>
          </div>
        </div>
      </GlassAlert>

      {/* Compact alert */}
      <GlassAlertCompact
        isVisible={isCompactVisible}
        onClose={() => setIsCompactVisible(false)}
        title="Компактное уведомление"
        description="Небольшое уведомление"
        type="success"
        position="top-center"
        showHeader
        showFooter
        showCloseButton
        showIcon
        showActions
        allowDismiss
        allowAutoDismiss
        actions={[
          {
            id: 'ok',
            label: 'OK',
            variant: 'primary',
            onClick: () => setIsCompactVisible(false)
          }
        ]}
        autoDismissDelay={3000}
        onOpen={() => console.log('Compact alert opened')}
        onAction={(actionId) => console.log('Compact alert action:', actionId)}
      >
        <p className="text-white/80 text-sm">Компактное уведомление для простых сообщений.</p>
      </GlassAlertCompact>

      {/* Detailed alert */}
      <GlassAlertDetailed
        isVisible={isDetailedVisible}
        onClose={() => setIsDetailedVisible(false)}
        title="Детальное уведомление"
        description="Большое уведомление с подробной информацией"
        type="warning"
        position="top-left"
        showHeader
        showFooter
        showCloseButton
        showIcon
        showActions
        showProgress
        showCountdown
        allowDismiss
        allowAutoDismiss
        allowClickOutside
        allowEscapeClose
        isClosable
        isExpandable
        isCollapsible
        actions={sampleActions}
        progress={60}
        countdown={10}
        autoDismissDelay={10000}
        onOpen={() => console.log('Detailed alert opened')}
        onAction={(actionId) => console.log('Detailed alert action:', actionId)}
        onExpand={() => console.log('Detailed alert expanded')}
        onCollapse={() => console.log('Detailed alert collapsed')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-glass-secondary/20 rounded-lg">
              <h4 className="font-semibold text-white mb-1">Секция 1</h4>
              <p className="text-white/70 text-xs">Содержимое первой секции</p>
            </div>
            <div className="p-3 bg-glass-secondary/20 rounded-lg">
              <h4 className="font-semibold text-white mb-1">Секция 2</h4>
              <p className="text-white/70 text-xs">Содержимое второй секции</p>
            </div>
          </div>
          <div className="p-3 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-1">Дополнительная информация</h4>
            <p className="text-white/70 text-xs">
              Детальное уведомление может содержать много контента и поддерживает прокрутку.
            </p>
          </div>
        </div>
      </GlassAlertDetailed>

      {/* Minimal alert */}
      <GlassAlertMinimal
        isVisible={isMinimalVisible}
        onClose={() => setIsMinimalVisible(false)}
        type="error"
        position="center"
        allowDismiss
        allowAutoDismiss
        allowClickOutside
        allowEscapeClose
        isClosable
        autoDismissDelay={4000}
        onOpen={() => console.log('Minimal alert opened')}
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Минимальное уведомление</h3>
          <p className="text-white/80 text-sm mb-3">Простое уведомление без заголовка и футера</p>
          <button
            onClick={() => setIsMinimalVisible(false)}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200"
          >
            Закрыть
          </button>
        </div>
      </GlassAlertMinimal>

      {/* Banner alert */}
      <GlassAlertBanner
        isVisible={isBannerVisible}
        onClose={() => setIsBannerVisible(false)}
        title="Баннер уведомление"
        description="Это баннер уведомление, которое отображается в верхней части экрана"
        type="info"
        size="lg"
        showHeader
        showFooter
        showCloseButton
        showIcon
        showActions
        allowDismiss
        allowAutoDismiss
        allowClickOutside
        allowEscapeClose
        isClosable
        actions={[
          {
            id: 'learn-more',
            label: 'Узнать больше',
            icon: ExternalLink,
            variant: 'primary',
            onClick: () => console.log('Learn more clicked')
          },
          {
            id: 'dismiss',
            label: 'Закрыть',
            variant: 'secondary',
            onClick: () => setIsBannerVisible(false)
          }
        ]}
        autoDismissDelay={8000}
        onOpen={() => console.log('Banner alert opened')}
        onAction={(actionId) => console.log('Banner alert action:', actionId)}
      >
        <div className="space-y-3">
          <p className="text-white/80">
            Баннер уведомление идеально подходит для важных объявлений и системных сообщений.
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/60">Системное сообщение</span>
          </div>
        </div>
      </GlassAlertBanner>

      {/* Toast alert */}
      <GlassAlertToast
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
        title="Toast уведомление"
        description="Это toast уведомление, которое отображается в правом нижнем углу"
        type="success"
        size="sm"
        showHeader
        showFooter
        showCloseButton
        showIcon
        showActions
        allowDismiss
        allowAutoDismiss
        allowClickOutside
        allowEscapeClose
        isClosable
        actions={[
          {
            id: 'undo',
            label: 'Отменить',
            icon: RotateCcw,
            variant: 'primary',
            onClick: () => console.log('Undo clicked')
          },
          {
            id: 'dismiss',
            label: 'Закрыть',
            variant: 'secondary',
            onClick: () => setIsToastVisible(false)
          }
        ]}
        autoDismissDelay={6000}
        onOpen={() => console.log('Toast alert opened')}
        onAction={(actionId) => console.log('Toast alert action:', actionId)}
      >
        <div className="space-y-2">
          <p className="text-white/80 text-sm">
            Toast уведомление для быстрых сообщений и подтверждений действий.
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-xs text-white/60">Успешно выполнено</span>
          </div>
        </div>
      </GlassAlertToast>
    </div>
  );
};
