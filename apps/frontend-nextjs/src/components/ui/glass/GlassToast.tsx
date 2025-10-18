'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X, 
  Loader2 
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  persistent?: boolean;
}

export interface GlassToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast container variants
const containerVariants = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
};

// Toast animation variants
const toastVariants = {
  initial: (position: string) => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    const isCenter = position.includes('center');
    
    if (isCenter) {
      return {
        opacity: 0,
        scale: 0.8,
        y: isTop ? -50 : 50
      };
    }
    
    return {
      opacity: 0,
      x: isLeft ? -300 : 300,
      y: isTop ? -20 : 20
    };
  },
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: (position: string) => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    const isCenter = position.includes('center');
    
    if (isCenter) {
      return {
        opacity: 0,
        scale: 0.8,
        y: isTop ? -50 : 50,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1]
        }
      };
    }
    
    return {
      opacity: 0,
      x: isLeft ? -300 : 300,
      y: isTop ? -20 : 20,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    };
  }
};

// Icon mapping
const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2
};

// Color mapping
const colorMap = {
  success: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    accent: 'bg-green-500/10'
  },
  error: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    accent: 'bg-red-500/10'
  },
  warning: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    accent: 'bg-yellow-500/10'
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    accent: 'bg-blue-500/10'
  },
  loading: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    icon: 'text-orange-400',
    accent: 'bg-orange-500/10'
  }
};

export const GlassToast: React.FC<GlassToastProps> = ({
  toast,
  onRemove,
  position = 'top-right'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const colors = colorMap[toast.type];
  const Icon = iconMap[toast.type];

  // Auto-remove toast after duration
  useEffect(() => {
    if (toast.persistent || toast.type === 'loading') return;

    const duration = toast.duration || 5000;
    const interval = 50;
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      if (!isHovered) {
        setProgress((prev) => {
          if (prev <= 0) {
            onRemove(toast.id);
            return 0;
          }
          return prev - decrement;
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [toast.duration, toast.persistent, toast.type, toast.id, onRemove, isHovered]);

  const handleClose = () => {
    onRemove(toast.id);
    toast.onClose?.();
  };

  return (
    <motion.div
      className={cn(
        'relative w-full max-w-sm',
        'bg-glass-primary/90 backdrop-blur-xl',
        'border border-glass-border/50',
        'rounded-2xl shadow-glass-lg',
        'overflow-hidden',
        colors.bg
      )}
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={position}
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Progress bar */}
      {!toast.persistent && toast.type !== 'loading' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
          <motion.div
            className={cn('h-full', colors.accent)}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 w-6 h-6 flex items-center justify-center',
            'rounded-full',
            colors.accent
          )}>
            <Icon className={cn('w-4 h-4', colors.icon)} />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="mt-1 text-sm text-white/80">
                {toast.description}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 p-1 rounded-lg',
              'text-white/60 hover:text-white',
              'hover:bg-white/10',
              'transition-all duration-200',
              'opacity-0 group-hover:opacity-100'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action button */}
        {toast.action && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={toast.action.onClick}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg',
                'bg-glass-accent/20 hover:bg-glass-accent/30',
                'border border-glass-border/50',
                'text-white hover:text-white',
                'transition-all duration-200'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
};

// Toast Container
export const GlassToastContainer: React.FC<{
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}> = ({ 
  position = 'top-right', 
  maxToasts = 5 
}) => {
  const { toasts } = useToast();

  return (
    <div className={cn(
      'fixed z-50 flex flex-col space-y-2',
      containerVariants[position]
    )}>
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, maxToasts).map((toast) => (
          <GlassToast
            key={toast.id}
            toast={toast}
            onRemove={useToast().removeToast}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast Provider
export const GlassToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <GlassToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a GlassToastProvider');
  }
  return context;
};

// Convenience functions
export const toast = {
  success: (title: string, description?: string, options?: Partial<Toast>) => {
    const { addToast } = useToast();
    return addToast({
      type: 'success',
      title,
      description,
      ...options
    });
  },
  error: (title: string, description?: string, options?: Partial<Toast>) => {
    const { addToast } = useToast();
    return addToast({
      type: 'error',
      title,
      description,
      ...options
    });
  },
  warning: (title: string, description?: string, options?: Partial<Toast>) => {
    const { addToast } = useToast();
    return addToast({
      type: 'warning',
      title,
      description,
      ...options
    });
  },
  info: (title: string, description?: string, options?: Partial<Toast>) => {
    const { addToast } = useToast();
    return addToast({
      type: 'info',
      title,
      description,
      ...options
    });
  },
  loading: (title: string, description?: string, options?: Partial<Toast>) => {
    const { addToast } = useToast();
    return addToast({
      type: 'loading',
      title,
      description,
      persistent: true,
      ...options
    });
  }
};
