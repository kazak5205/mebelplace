import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

export interface GlassToastProps {
  id?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

export interface GlassAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'success' | 'error' | 'warning' | 'info';
  variant?: 'banner' | 'inline' | 'floating';
  title?: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export interface GlassLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'spinner' | 'skeleton' | 'progress' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent';
  text?: string;
  progress?: number;
  className?: string;
}

export interface GlassEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

// Glass Toast Component
const GlassToast: React.FC<GlassToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  closable = true,
  onClose,
  position = 'top-right',
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const typeConfig = {
    success: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'glass-bg-primary',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400'
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'glass-bg-primary',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'glass-bg-primary',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'glass-bg-primary',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    }
  };

  const config = typeConfig[type];

  const positionClasses = {
    'top-right': ['top-4', 'right-4'],
    'top-left': ['top-4', 'left-4'],
    'bottom-right': ['bottom-4', 'right-4'],
    'bottom-left': ['bottom-4', 'left-4'],
    'top-center': ['top-4', 'left-1/2', 'transform', '-translate-x-1/2'],
    'bottom-center': ['bottom-4', 'left-1/2', 'transform', '-translate-x-1/2']
  };

  const classes = cn(
    'fixed z-50 max-w-sm w-full',
    'glass-shadow-lg rounded-xl border',
    'glass-transition',
    config.bgColor,
    config.borderColor,
    positionClasses[position],
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
    className
  );

  const toastContent = (
    <div className={classes}>
      <div className="flex items-start p-4">
        <div className={cn('flex-shrink-0 mr-3', config.iconColor)}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-medium glass-text-primary mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm glass-text-secondary">
            {message}
          </p>
        </div>
        
        {closable && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-3 glass-text-secondary hover:glass-text-primary glass-transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
};

// Glass Alert Component
const GlassAlert = React.forwardRef<HTMLDivElement, GlassAlertProps>(
  ({ 
    className,
    type = 'info',
    variant = 'inline',
    title,
    message,
    dismissible = false,
    onDismiss,
    icon,
    ...props 
  }, ref) => {
    const typeConfig = {
      success: {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        bgColor: 'glass-bg-primary',
        borderColor: 'border-green-500/30',
        iconColor: 'text-green-400'
      },
      error: {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        ),
        bgColor: 'glass-bg-primary',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-400'
      },
      warning: {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
        bgColor: 'glass-bg-primary',
        borderColor: 'border-yellow-500/30',
        iconColor: 'text-yellow-400'
      },
      info: {
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        ),
        bgColor: 'glass-bg-primary',
        borderColor: 'border-blue-500/30',
        iconColor: 'text-blue-400'
      }
    };

    const config = typeConfig[type];

    const variantClasses = {
      banner: ['w-full', 'rounded-none', 'border-x-0'],
      inline: ['rounded-lg', 'border'],
      floating: ['rounded-xl', 'border', 'glass-shadow-lg']
    };

    const classes = cn(
      'glass-transition p-4',
      config.bgColor,
      config.borderColor,
      variantClasses[variant],
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        <div className="flex items-start">
          <div className={cn('flex-shrink-0 mr-3', config.iconColor)}>
            {icon || config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-sm font-medium glass-text-primary mb-1">
                {title}
              </h3>
            )}
            {message && (
              <p className="text-sm glass-text-secondary">
                {message}
              </p>
            )}
          </div>
          
          {dismissible && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 ml-3 glass-text-secondary hover:glass-text-primary glass-transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

// Glass Loading Component
const GlassLoading = React.forwardRef<HTMLDivElement, GlassLoadingProps>(
  ({ 
    className,
    type = 'spinner',
    size = 'md',
    variant = 'primary',
    text,
    progress,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: ['w-4', 'h-4'],
      md: ['w-6', 'h-6'],
      lg: ['w-8', 'h-8'],
      xl: ['w-12', 'h-12']
    };

    const variantClasses = {
      primary: ['text-orange-500'],
      secondary: ['text-blue-500'],
      accent: ['text-purple-500']
    };

    const renderSpinner = () => (
      <div className={cn('border-2 border-current border-t-transparent rounded-full animate-spin', sizeClasses[size])} />
    );

    const renderDots = () => (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full animate-bounce',
              size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
              variantClasses[variant]
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );

    const renderPulse = () => (
      <div className={cn(
        'rounded-full animate-pulse',
        size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12',
        variant === 'primary' ? 'bg-orange-500/30' : variant === 'secondary' ? 'bg-blue-500/30' : 'bg-purple-500/30'
      )} />
    );

    const renderProgress = () => (
      <div className="w-full">
        <div className="flex justify-between text-sm glass-text-secondary mb-2">
          <span>{text}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              variant === 'primary' ? 'bg-orange-500' : variant === 'secondary' ? 'bg-blue-500' : 'bg-purple-500'
            )}
            style={{ width: `${progress || 0}%` }}
          />
        </div>
      </div>
    );

    const renderSkeleton = () => (
      <div className="space-y-2">
        <div className={cn('glass-bg-secondary rounded animate-pulse', sizeClasses[size])} />
        <div className="space-y-2">
          <div className="glass-bg-secondary h-2 rounded animate-pulse" />
          <div className="glass-bg-secondary h-2 rounded animate-pulse w-3/4" />
        </div>
      </div>
    );

    const renderLoading = () => {
      switch (type) {
        case 'spinner':
          return renderSpinner();
        case 'dots':
          return renderDots();
        case 'pulse':
          return renderPulse();
        case 'progress':
          return renderProgress();
        case 'skeleton':
          return renderSkeleton();
        default:
          return renderSpinner();
      }
    };

    const classes = cn(
      'flex items-center justify-center',
      type === 'progress' ? 'w-full' : '',
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {renderLoading()}
      </div>
    );
  }
);

// Glass Empty Component
const GlassEmpty = React.forwardRef<HTMLDivElement, GlassEmptyProps>(
  ({ 
    className,
    icon,
    title = 'No data',
    description,
    action,
    variant = 'primary',
    ...props 
  }, ref) => {
    const defaultIcon = (
      <svg className="w-16 h-16 glass-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
      </svg>
    );

    const variantClasses = {
      primary: ['glass-bg-primary', 'glass-border', 'glass-shadow-sm'],
      secondary: ['glass-bg-secondary', 'glass-border', 'glass-shadow-sm']
    };

    const classes = cn(
      'flex flex-col items-center justify-center p-8 rounded-xl text-center',
      variantClasses[variant],
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {icon && (
          <div className="mb-4">
            {icon}
          </div>
        )}
        
        {!icon && (
          <div className="mb-4">
            {defaultIcon}
          </div>
        )}
        
        <h3 className="text-lg font-medium glass-text-primary mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm glass-text-secondary mb-4 max-w-sm">
            {description}
          </p>
        )}
        
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

GlassAlert.displayName = 'GlassAlert';
GlassLoading.displayName = 'GlassLoading';
GlassEmpty.displayName = 'GlassEmpty';

export { GlassToast, GlassAlert, GlassLoading, GlassEmpty };
