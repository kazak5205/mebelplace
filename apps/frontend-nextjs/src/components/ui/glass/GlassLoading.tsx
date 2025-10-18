'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Loader,
  Loader2,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Zap,
  Sparkles,
  Star,
  Heart,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Pentagon,
  Hexagon as HexagonIcon,
  Octagon as OctagonIcon,
  Diamond as DiamondIcon,
  Pentagon as PentagonIcon,
  Circle as CircleIcon,
  Square as SquareIcon,
  Triangle as TriangleIcon,
  Check,
  X,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  VideoOff,
  Image,
  File,
  Folder,
  Download,
  Upload,
  Share2,
  Copy,
  Clipboard,
  Save,
  Edit,
  Trash2,
  Search,
  Filter,
  Settings,
  Home,
  User,
  Bell,
  Mail,
  Phone,
  MessageCircle,
  Users,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Bookmark,
  Flag,
  Target,
  Shield,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Info,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ExternalLink,
  Link,
  Unlink,
  Maximize,
  Minimize,
  Move,
  RotateCcw as RotateCcwIcon,
  RotateCw as RotateCwIcon,
  Zap as ZapIcon,
  Sparkles as SparklesIcon,
  Star as StarIcon,
  Heart as HeartIcon
} from 'lucide-react';

export interface LoadingVariant {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  animation?: 'spin' | 'pulse' | 'bounce' | 'ping' | 'wiggle' | 'shake' | 'float' | 'glow' | 'fade' | 'scale';
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface GlassLoadingProps {
  isVisible: boolean;
  onComplete?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'overlay' | 'inline' | 'fullscreen';
  type?: 'spinner' | 'dots' | 'bars' | 'pulse' | 'wave' | 'ripple' | 'bounce' | 'fade' | 'scale' | 'rotate' | 'custom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showHeader?: boolean;
  showFooter?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  showProgress?: boolean;
  showPercentage?: boolean;
  showBackdrop?: boolean;
  showOverlay?: boolean;
  allowCancel?: boolean;
  allowSkip?: boolean;
  isClosable?: boolean;
  isCentered?: boolean;
  isPersistent?: boolean;
  isFullscreen?: boolean;
  className?: string;
  backdropClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  progress?: number;
  maxProgress?: number;
  minProgress?: number;
  speed?: number;
  duration?: number;
  delay?: number;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  zIndex?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  onSkip?: () => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    width: 'w-32',
    height: 'h-32',
    maxWidth: 'max-w-xs',
    padding: 'p-4',
    headerPadding: 'p-4 pb-2',
    footerPadding: 'p-4 pt-2',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs',
    iconSize: 'w-6 h-6',
    spinnerSize: 'w-8 h-8'
  },
  md: {
    width: 'w-48',
    height: 'h-48',
    maxWidth: 'max-w-sm',
    padding: 'p-6',
    headerPadding: 'p-6 pb-4',
    footerPadding: 'p-6 pt-4',
    titleSize: 'text-base',
    descriptionSize: 'text-sm',
    iconSize: 'w-8 h-8',
    spinnerSize: 'w-12 h-12'
  },
  lg: {
    width: 'w-64',
    height: 'h-64',
    maxWidth: 'max-w-md',
    padding: 'p-8',
    headerPadding: 'p-8 pb-6',
    footerPadding: 'p-8 pt-6',
    titleSize: 'text-lg',
    descriptionSize: 'text-base',
    iconSize: 'w-10 h-10',
    spinnerSize: 'w-16 h-16'
  },
  xl: {
    width: 'w-80',
    height: 'h-80',
    maxWidth: 'max-w-lg',
    padding: 'p-10',
    headerPadding: 'p-10 pb-8',
    footerPadding: 'p-10 pt-8',
    titleSize: 'text-xl',
    descriptionSize: 'text-lg',
    iconSize: 'w-12 h-12',
    spinnerSize: 'w-20 h-20'
  },
  full: {
    width: 'w-full',
    height: 'h-full',
    maxWidth: 'max-w-none',
    padding: 'p-12',
    headerPadding: 'p-12 pb-10',
    footerPadding: 'p-12 pt-10',
    titleSize: 'text-2xl',
    descriptionSize: 'text-xl',
    iconSize: 'w-16 h-16',
    spinnerSize: 'w-24 h-24'
  }
};

// Type configurations
const typeConfig = {
  spinner: {
    icon: Loader,
    animation: 'spin',
    color: 'text-orange-400'
  },
  dots: {
    icon: Circle,
    animation: 'pulse',
    color: 'text-blue-400'
  },
  bars: {
    icon: Square,
    animation: 'bounce',
    color: 'text-green-400'
  },
  pulse: {
    icon: Circle,
    animation: 'pulse',
    color: 'text-purple-400'
  },
  wave: {
    icon: Zap,
    animation: 'wiggle',
    color: 'text-yellow-400'
  },
  ripple: {
    icon: Circle,
    animation: 'scale',
    color: 'text-pink-400'
  },
  bounce: {
    icon: Star,
    animation: 'bounce',
    color: 'text-red-400'
  },
  fade: {
    icon: Heart,
    animation: 'fade',
    color: 'text-indigo-400'
  },
  scale: {
    icon: Diamond,
    animation: 'scale',
    color: 'text-teal-400'
  },
  rotate: {
    icon: RotateCw,
    animation: 'spin',
    color: 'text-cyan-400'
  },
  custom: {
    icon: Settings,
    animation: 'spin',
    color: 'text-gray-400'
  }
};

// Position configurations
const positionConfig = {
  center: 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  top: 'fixed top-4 left-1/2 transform -translate-x-1/2',
  bottom: 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
  left: 'fixed left-4 top-1/2 transform -translate-y-1/2',
  right: 'fixed right-4 top-1/2 transform -translate-y-1/2',
  'top-left': 'fixed top-4 left-4',
  'top-right': 'fixed top-4 right-4',
  'bottom-left': 'fixed bottom-4 left-4',
  'bottom-right': 'fixed bottom-4 right-4'
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

const loadingVariants = {
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

const spinnerVariants = {
  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  },
  pulse: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  bounce: {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  ping: {
    animate: {
      scale: [1, 1.5, 1],
      opacity: [1, 0, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  wiggle: {
    animate: {
      rotate: [-10, 10, -10],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  shake: {
    animate: {
      x: [-5, 5, -5],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  float: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  glow: {
    animate: {
      boxShadow: [
        '0 0 0 0 rgba(255, 107, 53, 0.4)',
        '0 0 0 10px rgba(255, 107, 53, 0)',
        '0 0 0 0 rgba(255, 107, 53, 0)'
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  fade: {
    animate: {
      opacity: [1, 0.3, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  scale: {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
};

export const GlassLoading: React.FC<GlassLoadingProps> = ({
  isVisible,
  onComplete,
  title,
  description,
  children,
  variant = 'default',
  type = 'spinner',
  size = 'md',
  position = 'center',
  showHeader = true,
  showFooter = true,
  showTitle = true,
  showDescription = true,
  showIcon = true,
  showProgress = false,
  showPercentage = false,
  showBackdrop = true,
  showOverlay = true,
  allowCancel = false,
  allowSkip = false,
  isClosable = false,
  isCentered = true,
  isPersistent = false,
  isFullscreen = false,
  className,
  backdropClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  icon,
  progress,
  maxProgress = 100,
  minProgress = 0,
  speed = 1,
  duration = 1000,
  delay = 0,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  zIndex = 50,
  onOpen,
  onClose,
  onCancel,
  onSkip
}) => {
  const [currentProgress, setCurrentProgress] = useState(progress || 0);
  const [isCompleted, setIsCompleted] = useState(false);

  const loadingRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];
  const typeStyle = typeConfig[type];
  const positionStyle = positionConfig[position];

  // Handle loading open
  useEffect(() => {
    if (isVisible) {
      onOpen?.();
      
      // Simulate progress if not provided
      if (showProgress && progress === undefined) {
        const interval = setInterval(() => {
          setCurrentProgress((prev) => {
            if (prev >= maxProgress) {
              clearInterval(interval);
              setIsCompleted(true);
              onComplete?.();
              return maxProgress;
            }
            return prev + 1;
          });
        }, 50 / speed);
        
        return () => clearInterval(interval);
      }
    }
  }, [isVisible, showProgress, progress, maxProgress, speed, onOpen, onComplete]);

  // Handle progress updates
  useEffect(() => {
    if (progress !== undefined) {
      setCurrentProgress(progress);
      if (progress >= maxProgress) {
        setIsCompleted(true);
        onComplete?.();
      }
    }
  }, [progress, maxProgress, onComplete]);

  // Handle cancel
  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  // Handle skip
  const handleSkip = () => {
    onSkip?.();
    onClose?.();
  };

  // Get loading icon
  const getLoadingIcon = () => {
    if (icon) return icon;
    return typeStyle.icon;
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className={cn(
        'flex items-center space-x-3',
        config.headerPadding,
        headerClassName
      )}>
        {/* Icon */}
        {showIcon && (
          <div className="flex-shrink-0">
            <motion.div
              className={cn(
                'w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center',
                typeStyle.color
              )}
              variants={spinnerVariants[typeStyle.animation as keyof typeof spinnerVariants]}
              animate="animate"
            >
              <getLoadingIcon className={cn(config.iconSize)} />
            </motion.div>
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
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!showFooter) return null;

    return (
      <div className={cn(
        'flex items-center justify-between',
        config.footerPadding,
        footerClassName
      )}>
        <div className="flex items-center space-x-2">
          {/* Progress percentage */}
          {showPercentage && (
            <span className="text-sm text-white/60">
              {Math.round(currentProgress)}%
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Skip button */}
          {allowSkip && (
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
            >
              Пропустить
            </button>
          )}

          {/* Cancel button */}
          {allowCancel && (
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
            >
              Отмена
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render progress
  const renderProgress = () => {
    if (!showProgress) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Прогресс</span>
          {showPercentage && (
            <span className="text-sm text-white/60">{Math.round(currentProgress)}%</span>
          )}
        </div>
        <div className="w-full h-2 bg-glass-secondary/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  };

  // Render loading animation
  const renderLoadingAnimation = () => {
    const LoadingIcon = getLoadingIcon();

    switch (type) {
      case 'spinner':
        return (
          <motion.div
            className={cn(
              'w-16 h-16 border-4 border-glass-secondary/30 border-t-orange-500 rounded-full',
              config.spinnerSize
            )}
            variants={spinnerVariants.spin}
            animate="animate"
          />
        );

      case 'dots':
        return (
          <div className="flex items-center space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-orange-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                className="w-1 h-8 bg-orange-500 rounded-full"
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={cn(
              'w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center',
              config.spinnerSize
            )}
            variants={spinnerVariants.pulse}
            animate="animate"
          >
            <LoadingIcon className={cn('text-orange-400', config.iconSize)} />
          </motion.div>
        );

      case 'wave':
        return (
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-8 bg-orange-500 rounded-full"
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        );

      case 'ripple':
        return (
          <div className="relative">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="absolute w-16 h-16 border-2 border-orange-500 rounded-full"
                animate={{
                  scale: [1, 2, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        );

      case 'bounce':
        return (
          <motion.div
            className={cn(
              'w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center',
              config.spinnerSize
            )}
            variants={spinnerVariants.bounce}
            animate="animate"
          >
            <LoadingIcon className={cn('text-orange-400', config.iconSize)} />
          </motion.div>
        );

      case 'fade':
        return (
          <motion.div
            className={cn(
              'w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center',
              config.spinnerSize
            )}
            variants={spinnerVariants.fade}
            animate="animate"
          >
            <LoadingIcon className={cn('text-orange-400', config.iconSize)} />
          </motion.div>
        );

      case 'scale':
        return (
          <motion.div
            className={cn(
              'w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center',
              config.spinnerSize
            )}
            variants={spinnerVariants.scale}
            animate="animate"
          >
            <LoadingIcon className={cn('text-orange-400', config.iconSize)} />
          </motion.div>
        );

      case 'rotate':
        return (
          <motion.div
            className={cn(
              'w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center',
              config.spinnerSize
            )}
            variants={spinnerVariants.spin}
            animate="animate"
          >
            <LoadingIcon className={cn('text-orange-400', config.iconSize)} />
          </motion.div>
        );

      case 'custom':
        return (
          <motion.div
            className={cn(
              'w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center',
              config.spinnerSize
            )}
            variants={spinnerVariants[typeStyle.animation as keyof typeof spinnerVariants]}
            animate="animate"
          >
            <LoadingIcon className={cn('text-orange-400', config.iconSize)} />
          </motion.div>
        );

      default:
        return (
          <motion.div
            className={cn(
              'w-16 h-16 border-4 border-glass-secondary/30 border-t-orange-500 rounded-full',
              config.spinnerSize
            )}
            variants={spinnerVariants.spin}
            animate="animate"
          />
        );
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    if (size === 'full' || isFullscreen) {
      return 'w-full h-full max-w-none max-h-none';
    }
    return cn(config.width, config.height, config.maxWidth);
  };

  // Get position classes
  const getPositionClasses = () => {
    if (isFullscreen) {
      return 'fixed inset-0';
    }
    return positionStyle;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence onExitComplete={onClose}>
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
      >
        <motion.div
          ref={loadingRef}
          className={cn(
            'relative bg-glass-primary/90 backdrop-blur-xl',
            'border border-glass-border/50',
            'rounded-2xl shadow-glass-lg',
            'overflow-hidden',
            'flex flex-col',
            getSizeClasses(),
            getPositionClasses(),
            className
          )}
          style={{
            maxWidth: maxWidth || undefined,
            maxHeight: maxHeight || undefined,
            minWidth: minWidth || undefined,
            minHeight: minHeight || undefined
          }}
          variants={loadingVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Header */}
          {renderHeader()}

          {/* Body */}
          <div className={cn(
            'flex-1 flex flex-col items-center justify-center',
            config.padding,
            bodyClassName
          )}>
            {/* Loading animation */}
            <div className="mb-6">
              {renderLoadingAnimation()}
            </div>

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
export const GlassLoadingCompact: React.FC<Omit<GlassLoadingProps, 'variant' | 'size'>> = (props) => (
  <GlassLoading {...props} variant="compact" size="sm" />
);

export const GlassLoadingDetailed: React.FC<Omit<GlassLoadingProps, 'variant' | 'size'>> = (props) => (
  <GlassLoading {...props} variant="detailed" size="lg" />
);

export const GlassLoadingMinimal: React.FC<Omit<GlassLoadingProps, 'variant'>> = (props) => (
  <GlassLoading {...props} variant="minimal" showHeader={false} showFooter={false} showTitle={false} showDescription={false} />
);

export const GlassLoadingOverlay: React.FC<Omit<GlassLoadingProps, 'variant' | 'position'>> = (props) => (
  <GlassLoading {...props} variant="overlay" position="center" showBackdrop />
);

export const GlassLoadingInline: React.FC<Omit<GlassLoadingProps, 'variant' | 'position'>> = (props) => (
  <GlassLoading {...props} variant="inline" position="center" showBackdrop={false} />
);

export const GlassLoadingFullscreen: React.FC<Omit<GlassLoadingProps, 'variant' | 'size' | 'position'>> = (props) => (
  <GlassLoading {...props} variant="fullscreen" size="full" position="center" isFullscreen />
);

// Example usage component
export const GlassLoadingExample: React.FC = () => {
  const [isDefaultVisible, setIsDefaultVisible] = useState(false);
  const [isCompactVisible, setIsCompactVisible] = useState(false);
  const [isDetailedVisible, setIsDetailedVisible] = useState(false);
  const [isMinimalVisible, setIsMinimalVisible] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isInlineVisible, setIsInlineVisible] = useState(false);
  const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);

  const handleComplete = () => {
    console.log('Loading completed!');
  };

  const handleCancel = () => {
    console.log('Loading cancelled!');
  };

  const handleSkip = () => {
    console.log('Loading skipped!');
  };

  return (
    <div className="space-y-8 p-8">
      {/* Loading triggers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Индикаторы загрузки</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsDefaultVisible(true)}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200"
          >
            Обычная загрузка
          </button>
          <button
            onClick={() => setIsCompactVisible(true)}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200"
          >
            Компактная загрузка
          </button>
          <button
            onClick={() => setIsDetailedVisible(true)}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200"
          >
            Детальная загрузка
          </button>
          <button
            onClick={() => setIsMinimalVisible(true)}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200"
          >
            Минимальная загрузка
          </button>
          <button
            onClick={() => setIsOverlayVisible(true)}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200"
          >
            Overlay загрузка
          </button>
          <button
            onClick={() => setIsInlineVisible(true)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200"
          >
            Inline загрузка
          </button>
          <button
            onClick={() => setIsFullscreenVisible(true)}
            className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors duration-200"
          >
            Полноэкранная загрузка
          </button>
        </div>
      </div>

      {/* Default loading */}
      <GlassLoading
        isVisible={isDefaultVisible}
        onComplete={handleComplete}
        title="Загрузка"
        description="Пожалуйста, подождите..."
        type="spinner"
        size="md"
        position="center"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showProgress
        showPercentage
        showBackdrop
        allowCancel
        allowSkip
        isClosable
        isCentered
        progress={75}
        onOpen={() => console.log('Default loading opened')}
        onClose={() => setIsDefaultVisible(false)}
        onCancel={handleCancel}
        onSkip={handleSkip}
      >
        <div className="text-center">
          <p className="text-white/80 text-sm">
            Выполняется загрузка данных...
          </p>
        </div>
      </GlassLoading>

      {/* Compact loading */}
      <GlassLoadingCompact
        isVisible={isCompactVisible}
        onComplete={handleComplete}
        title="Загрузка"
        description="Подождите..."
        type="dots"
        position="center"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showProgress
        showPercentage
        allowCancel
        allowSkip
        progress={50}
        onOpen={() => console.log('Compact loading opened')}
        onClose={() => setIsCompactVisible(false)}
        onCancel={handleCancel}
        onSkip={handleSkip}
      >
        <div className="text-center">
          <p className="text-white/80 text-xs">
            Загрузка...
          </p>
        </div>
      </GlassLoadingCompact>

      {/* Detailed loading */}
      <GlassLoadingDetailed
        isVisible={isDetailedVisible}
        onComplete={handleComplete}
        title="Детальная загрузка"
        description="Выполняется сложная операция"
        type="bars"
        position="center"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showProgress
        showPercentage
        showBackdrop
        allowCancel
        allowSkip
        isClosable
        isCentered
        progress={90}
        onOpen={() => console.log('Detailed loading opened')}
        onClose={() => setIsDetailedVisible(false)}
        onCancel={handleCancel}
        onSkip={handleSkip}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-glass-secondary/20 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Этап 1</h4>
              <p className="text-white/70 text-sm">Инициализация системы</p>
            </div>
            <div className="p-4 bg-glass-secondary/20 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Этап 2</h4>
              <p className="text-white/70 text-sm">Загрузка данных</p>
            </div>
          </div>
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Дополнительная информация</h4>
            <p className="text-white/70 text-sm">
              Детальная загрузка может содержать много информации о процессе.
            </p>
          </div>
        </div>
      </GlassLoadingDetailed>

      {/* Minimal loading */}
      <GlassLoadingMinimal
        isVisible={isMinimalVisible}
        onComplete={handleComplete}
        type="pulse"
        position="center"
        showHeader
        showFooter
        showIcon
        showProgress
        showPercentage
        allowCancel
        allowSkip
        progress={25}
        onOpen={() => console.log('Minimal loading opened')}
        onClose={() => setIsMinimalVisible(false)}
        onCancel={handleCancel}
        onSkip={handleSkip}
      >
        <div className="text-center">
          <p className="text-white/80 text-sm">
            Минимальная загрузка без заголовка и описания
          </p>
        </div>
      </GlassLoadingMinimal>

      {/* Overlay loading */}
      <GlassLoadingOverlay
        isVisible={isOverlayVisible}
        onComplete={handleComplete}
        title="Overlay загрузка"
        description="Загрузка с overlay эффектом"
        type="wave"
        size="lg"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showProgress
        showPercentage
        allowCancel
        allowSkip
        isClosable
        isCentered
        progress={60}
        onOpen={() => console.log('Overlay loading opened')}
        onClose={() => setIsOverlayVisible(false)}
        onCancel={handleCancel}
        onSkip={handleSkip}
      >
        <div className="text-center">
          <p className="text-white/80">
            Overlay загрузка с backdrop эффектом
          </p>
        </div>
      </GlassLoadingOverlay>

      {/* Inline loading */}
      <GlassLoadingInline
        isVisible={isInlineVisible}
        onComplete={handleComplete}
        title="Inline загрузка"
        description="Загрузка без backdrop"
        type="ripple"
        size="md"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showProgress
        showPercentage
        allowCancel
        allowSkip
        isClosable
        isCentered
        progress={40}
        onOpen={() => console.log('Inline loading opened')}
        onClose={() => setIsInlineVisible(false)}
        onCancel={handleCancel}
        onSkip={handleSkip}
      >
        <div className="text-center">
          <p className="text-white/80 text-sm">
            Inline загрузка без backdrop эффекта
          </p>
        </div>
      </GlassLoadingInline>

      {/* Fullscreen loading */}
      <GlassLoadingFullscreen
        isVisible={isFullscreenVisible}
        onComplete={handleComplete}
        title="Полноэкранная загрузка"
        description="Загрузка на весь экран"
        type="bounce"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showProgress
        showPercentage
        showBackdrop
        allowCancel
        allowSkip
        isClosable
        isCentered
        isFullscreen
        progress={85}
        onOpen={() => console.log('Fullscreen loading opened')}
        onClose={() => setIsFullscreenVisible(false)}
        onCancel={handleCancel}
        onSkip={handleSkip}
      >
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white mb-4">Полноэкранная загрузка</h3>
          <p className="text-white/80 text-lg">
            Это загрузка занимает весь экран и идеально подходит для сложных операций.
          </p>
        </div>
      </GlassLoadingFullscreen>
    </div>
  );
};
