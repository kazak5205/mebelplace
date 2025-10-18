import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = [
      'glass-transition',
      'glass-interactive',
      'relative',
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'border',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:glass-disabled'
    ];

    const variantClasses = {
      primary: [
        'glass-bg-primary',
        'glass-border',
        'glass-shadow-base',
        'text-white',
        'hover:glass-shadow-md',
        'focus:ring-orange-500'
      ],
      secondary: [
        'glass-bg-secondary',
        'glass-border',
        'glass-shadow-sm',
        'text-white',
        'hover:glass-shadow-base',
        'focus:ring-blue-500'
      ],
      ghost: [
        'bg-transparent',
        'border-transparent',
        'text-white',
        'hover:glass-bg-primary',
        'focus:ring-purple-500'
      ],
      gradient: [
        'glass-gradient-accent',
        'glass-border-accent',
        'glass-shadow-md',
        'text-white',
        'hover:glass-shadow-lg',
        'focus:ring-orange-500'
      ],
      danger: [
        'glass-bg-primary',
        'glass-border',
        'glass-shadow-base',
        'text-red-400',
        'hover:glass-shadow-md',
        'hover:text-red-300',
        'focus:ring-red-500'
      ]
    };

    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm', 'rounded-md'],
      md: ['px-4', 'py-2', 'text-base', 'rounded-lg'],
      lg: ['px-6', 'py-3', 'text-lg', 'rounded-xl'],
      xl: ['px-8', 'py-4', 'text-xl', 'rounded-2xl']
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <div className={cn('flex items-center gap-2', loading && 'opacity-0')}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

export { GlassButton };
