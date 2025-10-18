'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Info,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ExternalLink,
  Copy,
  Link,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  Minus,
  Settings,
  Search,
  Filter,
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
  Shield,
  Key,
  Mail,
  Phone,
  User,
  Users,
  Home,
  Bell,
  MoreHorizontal,
  Maximize,
  Minimize,
  Move,
  RotateCcw,
  Save,
  RefreshCw,
  Loader,
  Check,
  XCircle,
  AlertCircle as Warning,
  Info as InfoIcon,
  HelpCircle as Help,
  Lightbulb as Tip,
  BookOpen as Doc,
  ExternalLink as External,
  Copy as CopyIcon,
  Link as LinkIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  MessageCircle as Message,
  Share2 as Share,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Trash2 as Trash,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
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
  Key as KeyIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  User as UserIcon,
  Users as UsersIcon,
  Home as HomeIcon,
  Bell as BellIcon,
  MoreHorizontal as More,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
  Move as MoveIcon,
  RotateCcw as RotateIcon,
  Save as SaveIcon,
  RefreshCw as RefreshIcon,
  Loader as LoaderIcon,
  Check as CheckIcon,
  XCircle as XCircleIcon
} from 'lucide-react';

export interface TooltipAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface TooltipContent {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  link?: string;
  actions?: TooltipAction[];
  metadata?: Record<string, string>;
  progress?: number;
  status?: 'success' | 'error' | 'warning' | 'info' | 'loading';
}

export interface GlassTooltipProps {
  children: React.ReactNode;
  content: string | TooltipContent;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'rich' | 'interactive';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  showArrow?: boolean;
  showIcon?: boolean;
  showActions?: boolean;
  showProgress?: boolean;
  showMetadata?: boolean;
  showImage?: boolean;
  showLink?: boolean;
  allowHover?: boolean;
  allowClick?: boolean;
  allowFocus?: boolean;
  allowKeyboard?: boolean;
  isDisabled?: boolean;
  isVisible?: boolean;
  isPersistent?: boolean;
  isInteractive?: boolean;
  isRich?: boolean;
  className?: string;
  contentClassName?: string;
  triggerClassName?: string;
  delay?: number;
  duration?: number;
  offset?: number;
  gap?: number;
  zIndex?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onAction?: (actionId: string) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    maxWidth: 'max-w-xs',
    padding: 'p-2',
    titleSize: 'text-xs',
    descriptionSize: 'text-xs',
    actionSize: 'text-xs',
    iconSize: 'w-3 h-3',
    imageSize: 'w-8 h-8'
  },
  md: {
    maxWidth: 'max-w-sm',
    padding: 'p-3',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs',
    actionSize: 'text-xs',
    iconSize: 'w-4 h-4',
    imageSize: 'w-12 h-12'
  },
  lg: {
    maxWidth: 'max-w-md',
    padding: 'p-4',
    titleSize: 'text-base',
    descriptionSize: 'text-sm',
    actionSize: 'text-sm',
    iconSize: 'w-5 h-5',
    imageSize: 'w-16 h-16'
  },
  xl: {
    maxWidth: 'max-w-lg',
    padding: 'p-6',
    titleSize: 'text-lg',
    descriptionSize: 'text-base',
    actionSize: 'text-base',
    iconSize: 'w-6 h-6',
    imageSize: 'w-20 h-20'
  },
  auto: {
    maxWidth: 'max-w-none',
    padding: 'p-3',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs',
    actionSize: 'text-xs',
    iconSize: 'w-4 h-4',
    imageSize: 'w-12 h-12'
  }
};

// Animation variants
const tooltipVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: 5
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 5,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const slideVariants = {
  top: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 }
  },
  bottom: {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 }
  },
  left: {
    initial: { opacity: 0, x: 8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 8 }
  },
  right: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 }
  }
};

export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  children,
  content,
  variant = 'default',
  size = 'md',
  position = 'top',
  showArrow = true,
  showIcon = true,
  showActions = true,
  showProgress = true,
  showMetadata = true,
  showImage = true,
  showLink = true,
  allowHover = true,
  allowClick = false,
  allowFocus = true,
  allowKeyboard = true,
  isDisabled = false,
  isVisible = false,
  isPersistent = false,
  isInteractive = false,
  isRich = false,
  className,
  contentClassName,
  triggerClassName,
  delay = 500,
  duration = 300,
  offset = 8,
  gap = 4,
  zIndex = 50,
  onOpen,
  onClose,
  onAction
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];

  // Parse content
  const parsedContent = typeof content === 'string' 
    ? { description: content } 
    : content;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Update position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;

    // Calculate position based on position prop
    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - offset;
        break;
      case 'top-start':
        x = triggerRect.left;
        y = triggerRect.top - tooltipRect.height - offset;
        break;
      case 'top-end':
        x = triggerRect.right - tooltipRect.width;
        y = triggerRect.top - tooltipRect.height - offset;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + offset;
        break;
      case 'bottom-start':
        x = triggerRect.left;
        y = triggerRect.bottom + offset;
        break;
      case 'bottom-end':
        x = triggerRect.right - tooltipRect.width;
        y = triggerRect.bottom + offset;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'left-start':
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.top;
        break;
      case 'left-end':
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.bottom - tooltipRect.height;
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right-start':
        x = triggerRect.right + offset;
        y = triggerRect.top;
        break;
      case 'right-end':
        x = triggerRect.right + offset;
        y = triggerRect.bottom - tooltipRect.height;
        break;
    }

    // Adjust position if tooltip goes outside viewport
    if (x < gap) x = gap;
    if (x + tooltipRect.width > viewportWidth - gap) x = viewportWidth - tooltipRect.width - gap;
    if (y < gap) y = gap;
    if (y + tooltipRect.height > viewportHeight - gap) y = viewportHeight - tooltipRect.height - gap;

    setTooltipPosition({ x, y });
  }, [position, offset, gap]);

  // Handle mouse enter
  const handleMouseEnter = () => {
    if (isDisabled || !allowHover) return;

    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    const timeout = setTimeout(() => {
      setIsOpen(true);
      onOpen?.();
    }, delay);

    setHoverTimeout(timeout);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    if (!isPersistent) {
      setIsOpen(false);
      onClose?.();
    }
  };

  // Handle click
  const handleClick = () => {
    if (isDisabled || !allowClick) return;

    if (isOpen) {
      setIsOpen(false);
      onClose?.();
    } else {
      setIsOpen(true);
      onOpen?.();
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (isDisabled || !allowFocus) return;

    setIsOpen(true);
    onOpen?.();
  };

  // Handle blur
  const handleBlur = () => {
    if (!isPersistent) {
      setIsOpen(false);
      onClose?.();
    }
  };

  // Handle action click
  const handleActionClick = (action: TooltipAction) => {
    if (action.disabled || action.loading) return;
    action.onClick();
    onAction?.(action.id);
  };

  // Get status icon
  const getStatusIcon = () => {
    if (!parsedContent.status) return null;

    const statusIcons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle,
      info: Info,
      loading: Loader
    };

    const StatusIcon = statusIcons[parsedContent.status];
    if (!StatusIcon) return null;

    return (
      <StatusIcon className={cn(
        'flex-shrink-0',
        config.iconSize,
        parsedContent.status === 'success' && 'text-green-400',
        parsedContent.status === 'error' && 'text-red-400',
        parsedContent.status === 'warning' && 'text-yellow-400',
        parsedContent.status === 'info' && 'text-blue-400',
        parsedContent.status === 'loading' && 'text-orange-400 animate-spin'
      )} />
    );
  };

  // Render header
  const renderHeader = () => {
    if (!parsedContent.title && !parsedContent.icon && !parsedContent.status) return null;

    return (
      <div className="flex items-center space-x-2 mb-2">
        {/* Icon */}
        {showIcon && (parsedContent.icon || parsedContent.status) && (
          <div className="flex-shrink-0">
            {parsedContent.status ? getStatusIcon() : (
              <parsedContent.icon className={cn('text-orange-400', config.iconSize)} />
            )}
          </div>
        )}

        {/* Title */}
        {parsedContent.title && (
          <h3 className={cn(
            'font-semibold text-white truncate',
            config.titleSize
          )}>
            {parsedContent.title}
          </h3>
        )}
      </div>
    );
  };

  // Render image
  const renderImage = () => {
    if (!showImage || !parsedContent.image) return null;

    return (
      <div className="mb-3">
        <img
          src={parsedContent.image}
          alt={parsedContent.title || 'Tooltip image'}
          className={cn(
            'rounded-lg object-cover',
            config.imageSize
          )}
        />
      </div>
    );
  };

  // Render description
  const renderDescription = () => {
    if (!parsedContent.description) return null;

    return (
      <p className={cn(
        'text-white/80 leading-relaxed',
        config.descriptionSize
      )}>
        {parsedContent.description}
      </p>
    );
  };

  // Render progress
  const renderProgress = () => {
    if (!showProgress || parsedContent.progress === undefined) return null;

    return (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/60">Прогресс</span>
          <span className="text-xs text-white/60">{Math.round(parsedContent.progress)}%</span>
        </div>
        <div className="w-full h-2 bg-glass-secondary/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${parsedContent.progress}%` }}
          />
        </div>
      </div>
    );
  };

  // Render metadata
  const renderMetadata = () => {
    if (!showMetadata || !parsedContent.metadata) return null;

    return (
      <div className="mt-3 space-y-1">
        {Object.entries(parsedContent.metadata).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-white/60">{key}</span>
            <span className="text-xs text-white/80">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render link
  const renderLink = () => {
    if (!showLink || !parsedContent.link) return null;

    return (
      <div className="mt-3">
        <a
          href={parsedContent.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-xs text-orange-400 hover:text-orange-300 transition-colors duration-200"
        >
          <span>Открыть ссылку</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  };

  // Render actions
  const renderActions = () => {
    if (!showActions || !parsedContent.actions || parsedContent.actions.length === 0) return null;

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {parsedContent.actions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled || action.loading}
              className={cn(
                'flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors duration-200',
                config.actionSize,
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
              {ActionIcon && <ActionIcon className="w-3 h-3" />}
              <span>{action.label}</span>
              {action.loading && (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Render arrow
  const renderArrow = () => {
    if (!showArrow) return null;

    const getArrowPosition = () => {
      switch (position) {
        case 'top':
        case 'top-start':
        case 'top-end':
          return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full';
        case 'bottom':
        case 'bottom-start':
        case 'bottom-end':
          return 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full';
        case 'left':
        case 'left-start':
        case 'left-end':
          return 'right-0 top-1/2 transform -translate-y-1/2 translate-x-full';
        case 'right':
        case 'right-start':
        case 'right-end':
          return 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full';
        default:
          return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full';
      }
    };

    return (
      <div className={cn(
        'absolute w-2 h-2 bg-glass-primary/90 border border-glass-border/50 transform rotate-45',
        getArrowPosition()
      )} />
    );
  };

  // Get size classes
  const getSizeClasses = () => {
    if (size === 'auto') {
      return 'w-auto';
    }
    return cn(config.maxWidth);
  };

  // Get animation variants
  const getAnimationVariants = () => {
    const basePosition = position.split('-')[0];
    return slideVariants[basePosition as keyof typeof slideVariants] || tooltipVariants;
  };

  // Update position when tooltip opens
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <div
        ref={triggerRef}
        className={cn('inline-block', triggerClassName)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={allowFocus ? 0 : undefined}
      >
        {children}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {(isOpen || isVisible) && !isDisabled && (
          <motion.div
            ref={tooltipRef}
            className={cn(
              'fixed bg-glass-primary/90 backdrop-blur-xl',
              'border border-glass-border/50',
              'rounded-lg shadow-glass-lg',
              'overflow-hidden',
              getSizeClasses(),
              config.padding,
              contentClassName
            )}
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              zIndex
            }}
            variants={getAnimationVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header */}
            {renderHeader()}

            {/* Image */}
            {renderImage()}

            {/* Description */}
            {renderDescription()}

            {/* Progress */}
            {renderProgress()}

            {/* Metadata */}
            {renderMetadata()}

            {/* Link */}
            {renderLink()}

            {/* Actions */}
            {renderActions()}

            {/* Arrow */}
            {renderArrow()}

            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Convenience components
export const GlassTooltipCompact: React.FC<Omit<GlassTooltipProps, 'variant' | 'size'>> = (props) => (
  <GlassTooltip {...props} variant="compact" size="sm" />
);

export const GlassTooltipDetailed: React.FC<Omit<GlassTooltipProps, 'variant' | 'size'>> = (props) => (
  <GlassTooltip {...props} variant="detailed" size="lg" />
);

export const GlassTooltipMinimal: React.FC<Omit<GlassTooltipProps, 'variant'>> = (props) => (
  <GlassTooltip {...props} variant="minimal" showIcon={false} showActions={false} showProgress={false} showMetadata={false} showImage={false} showLink={false} />
);

export const GlassTooltipRich: React.FC<Omit<GlassTooltipProps, 'variant'>> = (props) => (
  <GlassTooltip {...props} variant="rich" isRich showIcon showActions showProgress showMetadata showImage showLink />
);

export const GlassTooltipInteractive: React.FC<Omit<GlassTooltipProps, 'variant'>> = (props) => (
  <GlassTooltip {...props} variant="interactive" isInteractive allowClick allowKeyboard />
);

// Example usage component
export const GlassTooltipExample: React.FC = () => {
  const [isInteractiveOpen, setIsInteractiveOpen] = useState(false);

  const sampleContent: TooltipContent = {
    title: 'Пример Tooltip',
    description: 'Это пример расширенного Tooltip с дополнительной информацией, изображением и действиями.',
    icon: Info,
    image: 'https://via.placeholder.com/64x64/FF6B35/FFFFFF?text=IMG',
    link: 'https://example.com',
    actions: [
      {
        id: 'edit',
        label: 'Редактировать',
        icon: Edit,
        variant: 'primary',
        onClick: () => console.log('Edit clicked')
      },
      {
        id: 'delete',
        label: 'Удалить',
        icon: Trash2,
        variant: 'danger',
        onClick: () => console.log('Delete clicked')
      }
    ],
    metadata: {
      'Создано': '15.01.2024',
      'Автор': 'Admin',
      'Версия': '2.4.0'
    },
    progress: 75,
    status: 'success'
  };

  const sampleActions: TooltipAction[] = [
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
      onClick: () => setIsInteractiveOpen(false)
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Tooltip examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Расширенные Tooltips</h3>
        <div className="flex flex-wrap gap-4">
          {/* Simple tooltip */}
          <GlassTooltip
            content="Простой Tooltip с текстом"
            position="top"
            showArrow
          >
            <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Простой Tooltip
            </button>
          </GlassTooltip>

          {/* Compact tooltip */}
          <GlassTooltipCompact
            content="Компактный Tooltip"
            position="bottom"
            showArrow
          >
            <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Компактный Tooltip
            </button>
          </GlassTooltipCompact>

          {/* Detailed tooltip */}
          <GlassTooltipDetailed
            content={sampleContent}
            position="right"
            showArrow
            showIcon
            showActions
            showProgress
            showMetadata
            showImage
            showLink
          >
            <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Детальный Tooltip
            </button>
          </GlassTooltipDetailed>

          {/* Minimal tooltip */}
          <GlassTooltipMinimal
            content="Минимальный Tooltip без дополнительных элементов"
            position="left"
            showArrow
          >
            <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Минимальный Tooltip
            </button>
          </GlassTooltipMinimal>

          {/* Rich tooltip */}
          <GlassTooltipRich
            content={sampleContent}
            position="top"
            showArrow
            showIcon
            showActions
            showProgress
            showMetadata
            showImage
            showLink
            isRich
          >
            <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Rich Tooltip
            </button>
          </GlassTooltipRich>

          {/* Interactive tooltip */}
          <GlassTooltipInteractive
            content={{
              title: 'Интерактивный Tooltip',
              description: 'Этот Tooltip можно открыть и закрыть кликом.',
              icon: Settings,
              actions: sampleActions
            }}
            position="bottom"
            showArrow
            showIcon
            showActions
            allowClick
            allowKeyboard
            isInteractive
            onOpen={() => setIsInteractiveOpen(true)}
            onClose={() => setIsInteractiveOpen(false)}
            onAction={(actionId) => console.log('Interactive tooltip action:', actionId)}
          >
            <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Интерактивный Tooltip
            </button>
          </GlassTooltipInteractive>
        </div>
      </div>

      {/* Status tooltips */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Tooltips со статусами</h3>
        <div className="flex flex-wrap gap-4">
          <GlassTooltip
            content={{
              title: 'Успех',
              description: 'Операция выполнена успешно',
              status: 'success'
            }}
            position="top"
            showArrow
            showIcon
          >
            <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
              Success Tooltip
            </button>
          </GlassTooltip>

          <GlassTooltip
            content={{
              title: 'Ошибка',
              description: 'Произошла ошибка при выполнении операции',
              status: 'error'
            }}
            position="top"
            showArrow
            showIcon
          >
            <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
              Error Tooltip
            </button>
          </GlassTooltip>

          <GlassTooltip
            content={{
              title: 'Предупреждение',
              description: 'Внимание! Проверьте данные перед продолжением',
              status: 'warning'
            }}
            position="top"
            showArrow
            showIcon
          >
            <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
              Warning Tooltip
            </button>
          </GlassTooltip>

          <GlassTooltip
            content={{
              title: 'Информация',
              description: 'Дополнительная информация о функции',
              status: 'info'
            }}
            position="top"
            showArrow
            showIcon
          >
            <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
              Info Tooltip
            </button>
          </GlassTooltip>

          <GlassTooltip
            content={{
              title: 'Загрузка',
              description: 'Пожалуйста, подождите...',
              status: 'loading'
            }}
            position="top"
            showArrow
            showIcon
          >
            <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
              Loading Tooltip
            </button>
          </GlassTooltip>
        </div>
      </div>

      {/* Position examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Позиции Tooltips</h3>
        <div className="grid grid-cols-3 gap-4">
          <GlassTooltip
            content="Tooltip сверху"
            position="top"
            showArrow
          >
            <button className="w-full px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Top
            </button>
          </GlassTooltip>

          <GlassTooltip
            content="Tooltip снизу"
            position="bottom"
            showArrow
          >
            <button className="w-full px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Bottom
            </button>
          </GlassTooltip>

          <GlassTooltip
            content="Tooltip слева"
            position="left"
            showArrow
          >
            <button className="w-full px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Left
            </button>
          </GlassTooltip>

          <GlassTooltip
            content="Tooltip справа"
            position="right"
            showArrow
          >
            <button className="w-full px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Right
            </button>
          </GlassTooltip>

          <GlassTooltip
            content="Tooltip сверху слева"
            position="top-start"
            showArrow
          >
            <button className="w-full px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Top Start
            </button>
          </GlassTooltip>

          <GlassTooltip
            content="Tooltip сверху справа"
            position="top-end"
            showArrow
          >
            <button className="w-full px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
              Top End
            </button>
          </GlassTooltip>
        </div>
      </div>
    </div>
  );
};