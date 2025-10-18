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
  Maximize,
  Minimize,
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
  MessageCircle,
  Send,
  Reply,
  Forward,
  Link,
  Unlink,
  Upload,
  Folder,
  File,
  FolderOpen,
  FolderPlus,
  FilePlus,
  FileMinus,
  FolderMinus,
  Trash,
  Archive,
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
  KeyMinus
} from 'lucide-react';

export interface PopoverAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  divider?: boolean;
}

export interface PopoverSection {
  id: string;
  title?: string;
  items: PopoverAction[];
}

export interface GlassPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'menu' | 'tooltip';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
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
  showArrow?: boolean;
  showSections?: boolean;
  allowBackdropClose?: boolean;
  allowEscapeClose?: boolean;
  allowClickOutside?: boolean;
  allowHover?: boolean;
  allowFocus?: boolean;
  isClosable?: boolean;
  isPersistent?: boolean;
  isOverlay?: boolean;
  isPortal?: boolean;
  className?: string;
  backdropClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  actions?: PopoverAction[];
  sections?: PopoverSection[];
  icon?: React.ComponentType<{ className?: string }>;
  progress?: number;
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  zIndex?: number;
  offset?: number;
  gap?: number;
  onOpen?: () => void;
  onCloseComplete?: () => void;
  onAction?: (actionId: string) => void;
  onSectionClick?: (sectionId: string) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    width: 'w-48',
    height: 'h-auto',
    maxWidth: 'max-w-xs',
    padding: 'p-2',
    headerPadding: 'p-2 pb-1',
    footerPadding: 'p-2 pt-1',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs',
    itemPadding: 'px-2 py-1.5'
  },
  md: {
    width: 'w-64',
    height: 'h-auto',
    maxWidth: 'max-w-sm',
    padding: 'p-3',
    headerPadding: 'p-3 pb-2',
    footerPadding: 'p-3 pt-2',
    titleSize: 'text-base',
    descriptionSize: 'text-sm',
    itemPadding: 'px-3 py-2'
  },
  lg: {
    width: 'w-80',
    height: 'h-auto',
    maxWidth: 'max-w-md',
    padding: 'p-4',
    headerPadding: 'p-4 pb-3',
    footerPadding: 'p-4 pt-3',
    titleSize: 'text-lg',
    descriptionSize: 'text-base',
    itemPadding: 'px-4 py-2.5'
  },
  xl: {
    width: 'w-96',
    height: 'h-auto',
    maxWidth: 'max-w-lg',
    padding: 'p-6',
    headerPadding: 'p-6 pb-4',
    footerPadding: 'p-6 pt-4',
    titleSize: 'text-xl',
    descriptionSize: 'text-lg',
    itemPadding: 'px-6 py-3'
  },
  auto: {
    width: 'w-auto',
    height: 'h-auto',
    maxWidth: 'max-w-none',
    padding: 'p-3',
    headerPadding: 'p-3 pb-2',
    footerPadding: 'p-3 pt-2',
    titleSize: 'text-base',
    descriptionSize: 'text-sm',
    itemPadding: 'px-3 py-2'
  }
};

// Animation variants
const popoverVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: 10
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
    y: 10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const slideVariants = {
  top: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  },
  bottom: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  },
  left: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  },
  right: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  }
};

export const GlassPopover: React.FC<GlassPopoverProps> = ({
  isOpen,
  onClose,
  trigger,
  title,
  description,
  children,
  variant = 'default',
  size = 'md',
  position = 'bottom',
  showHeader = true,
  showFooter = true,
  showCloseButton = true,
  showBackdrop = false,
  showOverlay = true,
  showActions = true,
  showTitle = true,
  showDescription = true,
  showIcon = false,
  showProgress = false,
  showArrow = true,
  showSections = false,
  allowBackdropClose = true,
  allowEscapeClose = true,
  allowClickOutside = true,
  allowHover = false,
  allowFocus = false,
  isClosable = true,
  isPersistent = false,
  isOverlay = true,
  isPortal = true,
  className,
  backdropClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  actions = [],
  sections = [],
  icon,
  progress,
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  zIndex = 50,
  offset = 8,
  gap = 4,
  onOpen,
  onCloseComplete,
  onAction,
  onSectionClick
}) => {
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
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
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, allowEscapeClose, isClosable, onClose]);

  // Handle popover open
  useEffect(() => {
    if (isOpen) {
      onOpen?.();
      updatePosition();
    }
  }, [isOpen, onOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        allowClickOutside &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, allowClickOutside, onClose]);

  // Update position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;

    // Calculate position based on position prop
    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
        y = triggerRect.top - popoverRect.height - offset;
        break;
      case 'top-start':
        x = triggerRect.left;
        y = triggerRect.top - popoverRect.height - offset;
        break;
      case 'top-end':
        x = triggerRect.right - popoverRect.width;
        y = triggerRect.top - popoverRect.height - offset;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
        y = triggerRect.bottom + offset;
        break;
      case 'bottom-start':
        x = triggerRect.left;
        y = triggerRect.bottom + offset;
        break;
      case 'bottom-end':
        x = triggerRect.right - popoverRect.width;
        y = triggerRect.bottom + offset;
        break;
      case 'left':
        x = triggerRect.left - popoverRect.width - offset;
        y = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
        break;
      case 'left-start':
        x = triggerRect.left - popoverRect.width - offset;
        y = triggerRect.top;
        break;
      case 'left-end':
        x = triggerRect.left - popoverRect.width - offset;
        y = triggerRect.bottom - popoverRect.height;
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
        break;
      case 'right-start':
        x = triggerRect.right + offset;
        y = triggerRect.top;
        break;
      case 'right-end':
        x = triggerRect.right + offset;
        y = triggerRect.bottom - popoverRect.height;
        break;
    }

    // Adjust position if popover goes outside viewport
    if (x < gap) x = gap;
    if (x + popoverRect.width > viewportWidth - gap) x = viewportWidth - popoverRect.width - gap;
    if (y < gap) y = gap;
    if (y + popoverRect.height > viewportHeight - gap) y = viewportHeight - popoverRect.height - gap;

    setPopoverPosition({ x, y });
  }, [position, offset, gap]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === backdropRef.current && allowBackdropClose && isClosable) {
      onClose();
    }
  };

  // Handle action click
  const handleActionClick = (action: PopoverAction) => {
    if (action.disabled || action.loading) return;
    action.onClick();
    onAction?.(action.id);
  };

  // Handle section click
  const handleSectionClick = (section: PopoverSection) => {
    onSectionClick?.(section.id);
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
              <icon className="w-5 h-5 text-orange-400" />
            </div>
          )}

          {/* Title and description */}
          <div className="flex-1 min-w-0">
            {showTitle && title && (
              <h3 className={cn(
                'font-semibold text-white truncate',
                config.titleSize
              )}>
                {title}
              </h3>
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
              <div className="w-12 h-1.5 bg-glass-secondary/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
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
                  'flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm',
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
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render sections
  const renderSections = () => {
    if (!showSections || sections.length === 0) return null;

    return (
      <div className="space-y-1">
        {sections.map((section, sectionIndex) => (
          <div key={section.id}>
            {section.title && (
              <div className="px-3 py-2 text-xs font-medium text-white/60 uppercase tracking-wide">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((action, actionIndex) => {
                const ActionIcon = action.icon;
                return (
                  <React.Fragment key={action.id}>
                    <button
                      onClick={() => handleActionClick(action)}
                      disabled={action.disabled || action.loading}
                      className={cn(
                        'w-full flex items-center space-x-3 rounded-lg transition-colors duration-200 text-left',
                        config.itemPadding,
                        action.variant === 'primary' && 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30',
                        action.variant === 'secondary' && 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50',
                        action.variant === 'danger' && 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
                        action.variant === 'success' && 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
                        action.variant === 'warning' && 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30',
                        !action.variant && 'text-white/80 hover:bg-glass-secondary/30',
                        action.disabled && 'opacity-50 cursor-not-allowed',
                        action.loading && 'opacity-75 cursor-wait'
                      )}
                    >
                      {ActionIcon && <ActionIcon className="w-4 h-4 flex-shrink-0" />}
                      <span className="flex-1 truncate">{action.label}</span>
                      {action.loading && (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      )}
                    </button>
                    {action.divider && actionIndex < section.items.length - 1 && (
                      <div className="mx-3 h-px bg-glass-border/30" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {sectionIndex < sections.length - 1 && (
              <div className="mx-3 h-px bg-glass-border/30 my-2" />
            )}
          </div>
        ))}
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

    const getArrowIcon = () => {
      switch (position) {
        case 'top':
        case 'top-start':
        case 'top-end':
          return ArrowDown;
        case 'bottom':
        case 'bottom-start':
        case 'bottom-end':
          return ArrowUp;
        case 'left':
        case 'left-start':
        case 'left-end':
          return ArrowRight;
        case 'right':
        case 'right-start':
        case 'right-end':
          return ArrowLeft;
        default:
          return ArrowDown;
      }
    };

    const ArrowIcon = getArrowIcon();

    return (
      <div className={cn(
        'absolute w-2 h-2 bg-glass-primary/90 border border-glass-border/50 transform rotate-45',
        getArrowPosition()
      )}>
        <ArrowIcon className="w-3 h-3 text-white/60 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45" />
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
    const basePosition = position.split('-')[0];
    return slideVariants[basePosition as keyof typeof slideVariants] || popoverVariants;
  };

  if (!isOpen) return null;

  const popoverContent = (
    <motion.div
      ref={popoverRef}
      className={cn(
        'absolute bg-glass-primary/90 backdrop-blur-xl',
        'border border-glass-border/50',
        'rounded-xl shadow-glass-lg',
        'overflow-hidden',
        'flex flex-col',
        getSizeClasses(),
        className
      )}
      style={{
        left: popoverPosition.x,
        top: popoverPosition.y,
        width: width || undefined,
        height: height || undefined,
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        {renderSections()}
      </div>

      {/* Footer */}
      {renderFooter()}

      {/* Arrow */}
      {renderArrow()}

      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );

  return (
    <AnimatePresence onExitComplete={onCloseComplete}>
      <div className="relative">
        {/* Trigger */}
        {trigger && (
          <div ref={triggerRef} className="inline-block">
            {trigger}
          </div>
        )}

        {/* Backdrop */}
        {showBackdrop && (
          <motion.div
            ref={backdropRef}
            className={cn(
              'fixed inset-0 z-40',
              'bg-black/20 backdrop-blur-sm',
              backdropClassName
            )}
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 }
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={handleBackdropClick}
          />
        )}

        {/* Popover */}
        {isPortal ? (
          <div
            className="fixed inset-0 pointer-events-none z-50"
            style={{ zIndex }}
          >
            {popoverContent}
          </div>
        ) : (
          popoverContent
        )}
      </div>
    </AnimatePresence>
  );
};

// Convenience components
export const GlassPopoverCompact: React.FC<Omit<GlassPopoverProps, 'variant' | 'size'>> = (props) => (
  <GlassPopover {...props} variant="compact" size="sm" />
);

export const GlassPopoverDetailed: React.FC<Omit<GlassPopoverProps, 'variant' | 'size'>> = (props) => (
  <GlassPopover {...props} variant="detailed" size="lg" />
);

export const GlassPopoverMinimal: React.FC<Omit<GlassPopoverProps, 'variant'>> = (props) => (
  <GlassPopover {...props} variant="minimal" showHeader={false} showFooter={false} showCloseButton={false} />
);

export const GlassPopoverMenu: React.FC<Omit<GlassPopoverProps, 'variant'>> = (props) => (
  <GlassPopover {...props} variant="menu" showSections showArrow={false} />
);

export const GlassPopoverTooltip: React.FC<Omit<GlassPopoverProps, 'variant' | 'size'>> = (props) => (
  <GlassPopover {...props} variant="tooltip" size="auto" showHeader={false} showFooter={false} showCloseButton={false} showArrow />
);

// Example usage component
export const GlassPopoverExample: React.FC = () => {
  const [isDefaultOpen, setIsDefaultOpen] = useState(false);
  const [isCompactOpen, setIsCompactOpen] = useState(false);
  const [isDetailedOpen, setIsDetailedOpen] = useState(false);
  const [isMinimalOpen, setIsMinimalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const sampleActions: PopoverAction[] = [
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
    },
    {
      id: 'share',
      label: 'Поделиться',
      icon: Share2,
      variant: 'secondary',
      onClick: () => console.log('Share clicked')
    }
  ];

  const sampleSections: PopoverSection[] = [
    {
      id: 'actions',
      title: 'Действия',
      items: [
        {
          id: 'edit',
          label: 'Редактировать',
          icon: Edit,
          onClick: () => console.log('Edit clicked')
        },
        {
          id: 'copy',
          label: 'Копировать',
          icon: Copy,
          onClick: () => console.log('Copy clicked')
        },
        {
          id: 'move',
          label: 'Переместить',
          icon: Move,
          onClick: () => console.log('Move clicked')
        }
      ]
    },
    {
      id: 'settings',
      title: 'Настройки',
      items: [
        {
          id: 'preferences',
          label: 'Предпочтения',
          icon: Settings,
          onClick: () => console.log('Preferences clicked')
        },
        {
          id: 'bookmark',
          label: 'В закладки',
          icon: Bookmark,
          onClick: () => console.log('Bookmark clicked')
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Popover triggers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Всплывающие окна</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsDefaultOpen(!isDefaultOpen)}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200"
          >
            Обычный Popover
          </button>
          <button
            onClick={() => setIsCompactOpen(!isCompactOpen)}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200"
          >
            Компактный Popover
          </button>
          <button
            onClick={() => setIsDetailedOpen(!isDetailedOpen)}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200"
          >
            Детальный Popover
          </button>
          <button
            onClick={() => setIsMinimalOpen(!isMinimalOpen)}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200"
          >
            Минимальный Popover
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200"
          >
            Меню Popover
          </button>
          <button
            onClick={() => setIsTooltipOpen(!isTooltipOpen)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200"
          >
            Tooltip Popover
          </button>
        </div>
      </div>

      {/* Default popover */}
      <GlassPopover
        isOpen={isDefaultOpen}
        onClose={() => setIsDefaultOpen(false)}
        trigger={
          <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
            Открыть Popover
          </button>
        }
        title="Заголовок Popover"
        description="Описание Popover с дополнительной информацией"
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
        showArrow
        allowBackdropClose
        allowEscapeClose
        allowClickOutside
        isClosable
        isOverlay
        isPortal
        actions={sampleActions}
        progress={75}
        onOpen={() => console.log('Default popover opened')}
        onClose={() => console.log('Default popover closed')}
        onAction={(actionId) => console.log('Default popover action:', actionId)}
      >
        <div className="space-y-3">
          <p className="text-white/80 text-sm">
            Это содержимое обычного Popover. Здесь может быть любой контент - формы, текст, изображения и т.д.
          </p>
          <div className="p-3 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-1">Пример контента</h4>
            <p className="text-white/70 text-xs">
              Popover поддерживает различные размеры, позиции и варианты отображения.
            </p>
          </div>
        </div>
      </GlassPopover>

      {/* Compact popover */}
      <GlassPopoverCompact
        isOpen={isCompactOpen}
        onClose={() => setIsCompactOpen(false)}
        trigger={
          <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
            Компактный Popover
          </button>
        }
        title="Компактный Popover"
        description="Небольшой Popover"
        position="top"
        showHeader
        showFooter
        showCloseButton
        showActions
        showTitle
        showDescription
        showArrow
        actions={[
          {
            id: 'ok',
            label: 'OK',
            variant: 'primary',
            onClick: () => setIsCompactOpen(false)
          }
        ]}
        onOpen={() => console.log('Compact popover opened')}
        onClose={() => console.log('Compact popover closed')}
        onAction={(actionId) => console.log('Compact popover action:', actionId)}
      >
        <p className="text-white/80 text-sm">Компактный Popover для простых уведомлений.</p>
      </GlassPopoverCompact>

      {/* Detailed popover */}
      <GlassPopoverDetailed
        isOpen={isDetailedOpen}
        onClose={() => setIsDetailedOpen(false)}
        trigger={
          <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
            Детальный Popover
          </button>
        }
        title="Детальный Popover"
        description="Большой Popover с подробной информацией"
        position="right"
        showHeader
        showFooter
        showCloseButton
        showActions
        showTitle
        showDescription
        showIcon
        showProgress
        showArrow
        actions={sampleActions}
        progress={60}
        onOpen={() => console.log('Detailed popover opened')}
        onClose={() => console.log('Detailed popover closed')}
        onAction={(actionId) => console.log('Detailed popover action:', actionId)}
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
              Детальный Popover может содержать много контента и поддерживает прокрутку.
            </p>
          </div>
        </div>
      </GlassPopoverDetailed>

      {/* Minimal popover */}
      <GlassPopoverMinimal
        isOpen={isMinimalOpen}
        onClose={() => setIsMinimalOpen(false)}
        trigger={
          <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
            Минимальный Popover
          </button>
        }
        position="left"
        allowBackdropClose
        allowEscapeClose
        allowClickOutside
        onOpen={() => console.log('Minimal popover opened')}
        onClose={() => console.log('Minimal popover closed')}
      >
        <div className="text-center py-4">
          <h3 className="text-sm font-semibold text-white mb-2">Минимальный Popover</h3>
          <p className="text-white/80 text-xs mb-3">Простой Popover без заголовка и футера</p>
          <button
            onClick={() => setIsMinimalOpen(false)}
            className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200 text-xs"
          >
            Закрыть
          </button>
        </div>
      </GlassPopoverMinimal>

      {/* Menu popover */}
      <GlassPopoverMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        trigger={
          <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
            Меню Popover
          </button>
        }
        title="Меню"
        position="bottom-start"
        size="auto"
        showHeader
        showSections
        showArrow
        sections={sampleSections}
        onOpen={() => console.log('Menu popover opened')}
        onClose={() => console.log('Menu popover closed')}
        onAction={(actionId) => console.log('Menu popover action:', actionId)}
        onSectionClick={(sectionId) => console.log('Menu popover section:', sectionId)}
      />

      {/* Tooltip popover */}
      <GlassPopoverTooltip
        isOpen={isTooltipOpen}
        onClose={() => setIsTooltipOpen(false)}
        trigger={
          <button className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white rounded-lg transition-colors duration-200">
            Tooltip Popover
          </button>
        }
        position="top"
        showArrow
        allowClickOutside
        onOpen={() => console.log('Tooltip popover opened')}
        onClose={() => console.log('Tooltip popover closed')}
      >
        <div className="text-center py-2">
          <p className="text-white/80 text-sm">Это Tooltip Popover с подсказкой</p>
        </div>
      </GlassPopoverTooltip>
    </div>
  );
};

