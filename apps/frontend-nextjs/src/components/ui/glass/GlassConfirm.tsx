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
  Loader,
  Check,
  XCircle,
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

export interface ConfirmAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
}

export interface GlassConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'destructive' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  type?: 'question' | 'warning' | 'danger' | 'info' | 'success' | 'custom';
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
  showCountdown?: boolean;
  allowBackdropClose?: boolean;
  allowEscapeClose?: boolean;
  isClosable?: boolean;
  isCentered?: boolean;
  isScrollable?: boolean;
  isPersistent?: boolean;
  isDestructive?: boolean;
  isWarning?: boolean;
  className?: string;
  backdropClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  actions?: ConfirmAction[];
  icon?: React.ComponentType<{ className?: string }>;
  progress?: number;
  countdown?: number;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  zIndex?: number;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  cancelVariant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
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
  question: {
    icon: HelpCircle,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/10'
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/10'
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10'
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/10'
  },
  custom: {
    icon: Settings,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/10'
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

const confirmVariants = {
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

export const GlassConfirm: React.FC<GlassConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  description,
  children,
  variant = 'default',
  size = 'md',
  type = 'question',
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
  showCountdown = false,
  allowBackdropClose = true,
  allowEscapeClose = true,
  isClosable = true,
  isCentered = true,
  isScrollable = true,
  isPersistent = false,
  isDestructive = false,
  isWarning = false,
  className,
  backdropClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  actions = [],
  icon,
  progress,
  countdown,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  zIndex = 50,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmVariant = 'primary',
  cancelVariant = 'secondary',
  onOpen,
  onCloseComplete,
  onAction
}) => {
  const [currentCountdown, setCurrentCountdown] = useState(countdown || 0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const confirmRef = useRef<HTMLDivElement>(null);
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

  // Handle confirm open
  useEffect(() => {
    if (isOpen) {
      onOpen?.();
      
      // Start countdown timer
      if (showCountdown && countdown && countdown > 0) {
        setCurrentCountdown(countdown);
        const countdownInterval = setInterval(() => {
          setCurrentCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  }, [isOpen, showCountdown, countdown, onOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === backdropRef.current && allowBackdropClose && isClosable) {
      onClose();
    }
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (isConfirming) return;
    
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirm error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    if (isCancelling) return;
    
    setIsCancelling(true);
    try {
      if (onCancel) {
        await onCancel();
      }
      onClose();
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle action click
  const handleActionClick = (action: ConfirmAction) => {
    if (action.disabled || action.loading) return;
    action.onClick();
    onAction?.(action.id);
  };

  // Get confirm icon
  const getConfirmIcon = () => {
    if (icon) return icon;
    return typeStyle.icon;
  };

  // Get default actions
  const getDefaultActions = (): ConfirmAction[] => {
    if (actions.length > 0) return actions;

    return [
      {
        id: 'confirm',
        label: confirmText,
        icon: Check,
        variant: confirmVariant,
        onClick: handleConfirm,
        loading: isConfirming,
        autoFocus: true
      },
      {
        id: 'cancel',
        label: cancelText,
        variant: cancelVariant,
        onClick: handleCancel,
        loading: isCancelling
      }
    ];
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;

    const ConfirmIcon = getConfirmIcon();

    return (
      <div className={cn(
        'flex items-center space-x-4',
        config.headerPadding,
        headerClassName
      )}>
        {/* Icon */}
        {showIcon && ConfirmIcon && (
          <div className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
            typeStyle.iconBg
          )}>
            <ConfirmIcon className={cn('w-6 h-6', typeStyle.iconColor)} />
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
    if (!showFooter || !showActions) return null;

    const defaultActions = getDefaultActions();

    return (
      <div className={cn(
        'flex items-center justify-end space-x-3',
        config.footerPadding,
        footerClassName
      )}>
        {defaultActions.map((action) => {
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

  // Render countdown
  const renderCountdown = () => {
    if (!showCountdown || currentCountdown <= 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-glass-secondary/30 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-white">{currentCountdown}</span>
          </div>
        </div>
        <p className="text-center text-sm text-white/60 mt-2">
          Автоматическое закрытие через {currentCountdown} сек.
        </p>
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

  // Get background classes
  const getBackgroundClasses = () => {
    return cn(
      'bg-glass-primary/90 backdrop-blur-xl',
      typeStyle.bgColor
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
          ref={confirmRef}
          className={cn(
            'relative',
            getBackgroundClasses(),
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
          variants={confirmVariants}
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

            {/* Countdown */}
            {renderCountdown()}

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
export const GlassConfirmCompact: React.FC<Omit<GlassConfirmProps, 'variant' | 'size'>> = (props) => (
  <GlassConfirm {...props} variant="compact" size="sm" />
);

export const GlassConfirmDetailed: React.FC<Omit<GlassConfirmProps, 'variant' | 'size'>> = (props) => (
  <GlassConfirm {...props} variant="detailed" size="lg" />
);

export const GlassConfirmMinimal: React.FC<Omit<GlassConfirmProps, 'variant'>> = (props) => (
  <GlassConfirm {...props} variant="minimal" showHeader={false} showFooter={false} showCloseButton={false} />
);

export const GlassConfirmDestructive: React.FC<Omit<GlassConfirmProps, 'variant' | 'type' | 'isDestructive'>> = (props) => (
  <GlassConfirm {...props} variant="destructive" type="danger" isDestructive confirmVariant="danger" />
);

export const GlassConfirmWarning: React.FC<Omit<GlassConfirmProps, 'variant' | 'type' | 'isWarning'>> = (props) => (
  <GlassConfirm {...props} variant="warning" type="warning" isWarning confirmVariant="warning" />
);

// Example usage component
export const GlassConfirmExample: React.FC = () => {
  const [isDefaultOpen, setIsDefaultOpen] = useState(false);
  const [isCompactOpen, setIsCompactOpen] = useState(false);
  const [isDetailedOpen, setIsDetailedOpen] = useState(false);
  const [isMinimalOpen, setIsMinimalOpen] = useState(false);
  const [isDestructiveOpen, setIsDestructiveOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  const handleConfirm = () => {
    console.log('Confirmed!');
  };

  const handleCancel = () => {
    console.log('Cancelled!');
  };

  return (
    <div className="space-y-8 p-8">
      {/* Confirm triggers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Подтверждения</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsDefaultOpen(true)}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200"
          >
            Обычное подтверждение
          </button>
          <button
            onClick={() => setIsCompactOpen(true)}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200"
          >
            Компактное подтверждение
          </button>
          <button
            onClick={() => setIsDetailedOpen(true)}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200"
          >
            Детальное подтверждение
          </button>
          <button
            onClick={() => setIsMinimalOpen(true)}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200"
          >
            Минимальное подтверждение
          </button>
          <button
            onClick={() => setIsDestructiveOpen(true)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200"
          >
            Деструктивное подтверждение
          </button>
          <button
            onClick={() => setIsWarningOpen(true)}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200"
          >
            Предупреждающее подтверждение
          </button>
        </div>
      </div>

      {/* Default confirm */}
      <GlassConfirm
        isOpen={isDefaultOpen}
        onClose={() => setIsDefaultOpen(false)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Подтверждение действия"
        description="Вы уверены, что хотите выполнить это действие?"
        type="question"
        size="md"
        showHeader
        showFooter
        showCloseButton
        showBackdrop
        showActions
        showTitle
        showDescription
        showIcon
        allowBackdropClose
        allowEscapeClose
        isClosable
        isCentered
        isScrollable
        confirmText="Да, выполнить"
        cancelText="Отмена"
        confirmVariant="primary"
        cancelVariant="secondary"
        onOpen={() => console.log('Default confirm opened')}
        onAction={(actionId) => console.log('Default confirm action:', actionId)}
      >
        <div className="space-y-4">
          <p className="text-white/80">
            Это действие нельзя будет отменить. Пожалуйста, убедитесь, что вы хотите продолжить.
          </p>
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Детали действия</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Действие будет выполнено немедленно</li>
              <li>• Изменения нельзя будет отменить</li>
              <li>• Все связанные данные будут обновлены</li>
            </ul>
          </div>
        </div>
      </GlassConfirm>

      {/* Compact confirm */}
      <GlassConfirmCompact
        isOpen={isCompactOpen}
        onClose={() => setIsCompactOpen(false)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Подтвердить?"
        description="Вы уверены?"
        type="info"
        showHeader
        showFooter
        showCloseButton
        showActions
        showTitle
        showDescription
        showIcon
        confirmText="Да"
        cancelText="Нет"
        confirmVariant="primary"
        cancelVariant="secondary"
        onOpen={() => console.log('Compact confirm opened')}
        onAction={(actionId) => console.log('Compact confirm action:', actionId)}
      >
        <p className="text-white/80 text-sm">Простое подтверждение для быстрых действий.</p>
      </GlassConfirmCompact>

      {/* Detailed confirm */}
      <GlassConfirmDetailed
        isOpen={isDetailedOpen}
        onClose={() => setIsDetailedOpen(false)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Подробное подтверждение"
        description="Это действие требует дополнительного подтверждения"
        type="warning"
        showHeader
        showFooter
        showCloseButton
        showActions
        showTitle
        showDescription
        showIcon
        showProgress
        showCountdown
        progress={75}
        countdown={10}
        confirmText="Подтвердить действие"
        cancelText="Отменить"
        confirmVariant="warning"
        cancelVariant="secondary"
        onOpen={() => console.log('Detailed confirm opened')}
        onAction={(actionId) => console.log('Detailed confirm action:', actionId)}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-glass-secondary/20 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Влияние</h4>
              <p className="text-white/70 text-sm">Это действие повлияет на все связанные элементы</p>
            </div>
            <div className="p-4 bg-glass-secondary/20 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Время выполнения</h4>
              <p className="text-white/70 text-sm">Примерно 2-3 минуты</p>
            </div>
          </div>
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Дополнительная информация</h4>
            <p className="text-white/70 text-sm">
              Детальное подтверждение может содержать много информации и поддерживает прокрутку.
            </p>
          </div>
        </div>
      </GlassConfirmDetailed>

      {/* Minimal confirm */}
      <GlassConfirmMinimal
        isOpen={isMinimalOpen}
        onClose={() => setIsMinimalOpen(false)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        type="success"
        allowBackdropClose
        allowEscapeClose
        confirmText="OK"
        cancelText="Отмена"
        confirmVariant="success"
        cancelVariant="secondary"
        onOpen={() => console.log('Minimal confirm opened')}
        onAction={(actionId) => console.log('Minimal confirm action:', actionId)}
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Минимальное подтверждение</h3>
          <p className="text-white/80 mb-4">Простое подтверждение без заголовка и футера</p>
        </div>
      </GlassConfirmMinimal>

      {/* Destructive confirm */}
      <GlassConfirmDestructive
        isOpen={isDestructiveOpen}
        onClose={() => setIsDestructiveOpen(false)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Удаление данных"
        description="Это действие необратимо и удалит все данные"
        size="md"
        showHeader
        showFooter
        showCloseButton
        showActions
        showTitle
        showDescription
        showIcon
        allowBackdropClose
        allowEscapeClose
        isClosable
        isCentered
        isScrollable
        confirmText="Удалить навсегда"
        cancelText="Отмена"
        confirmVariant="danger"
        cancelVariant="secondary"
        onOpen={() => console.log('Destructive confirm opened')}
        onAction={(actionId) => console.log('Destructive confirm action:', actionId)}
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h4 className="font-semibold text-red-300 mb-2">⚠️ Внимание!</h4>
            <p className="text-red-200/80 text-sm">
              Это действие удалит все данные без возможности восстановления. 
              Убедитесь, что вы действительно хотите продолжить.
            </p>
          </div>
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Что будет удалено:</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Все пользовательские данные</li>
              <li>• Настройки и конфигурации</li>
              <li>• История действий</li>
              <li>• Связанные файлы и документы</li>
            </ul>
          </div>
        </div>
      </GlassConfirmDestructive>

      {/* Warning confirm */}
      <GlassConfirmWarning
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Предупреждение"
        description="Это действие может иметь нежелательные последствия"
        size="md"
        showHeader
        showFooter
        showCloseButton
        showActions
        showTitle
        showDescription
        showIcon
        allowBackdropClose
        allowEscapeClose
        isClosable
        isCentered
        isScrollable
        confirmText="Продолжить"
        cancelText="Отмена"
        confirmVariant="warning"
        cancelVariant="secondary"
        onOpen={() => console.log('Warning confirm opened')}
        onAction={(actionId) => console.log('Warning confirm action:', actionId)}
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h4 className="font-semibold text-yellow-300 mb-2">⚠️ Предупреждение</h4>
            <p className="text-yellow-200/80 text-sm">
              Это действие может повлиять на работу системы. 
              Рекомендуется создать резервную копию перед продолжением.
            </p>
          </div>
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Возможные последствия:</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Временная недоступность сервиса</li>
              <li>• Изменение настроек системы</li>
              <li>• Обновление конфигураций</li>
              <li>• Перезапуск служб</li>
            </ul>
          </div>
        </div>
      </GlassConfirmWarning>
    </div>
  );
};
