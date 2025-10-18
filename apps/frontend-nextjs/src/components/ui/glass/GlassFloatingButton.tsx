import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassFloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  icon: React.ReactNode;
  label?: string;
  loading?: boolean;
  pulse?: boolean;
}

const GlassFloatingButton = React.forwardRef<HTMLButtonElement, GlassFloatingButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    position = 'bottom-right',
    icon,
    label,
    loading = false,
    pulse = false,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = [
      'glass-transition',
      'glass-interactive',
      'fixed',
      'z-50',
      'relative',
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'border',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:glass-disabled',
      'rounded-full',
      'shadow-2xl'
    ];

    const variantClasses = {
      primary: [
        'glass-bg-primary',
        'glass-border',
        'glass-shadow-lg',
        'glass-text-primary',
        'hover:glass-shadow-xl',
        'focus:ring-orange-500'
      ],
      secondary: [
        'glass-bg-secondary',
        'glass-border',
        'glass-shadow-md',
        'glass-text-primary',
        'hover:glass-shadow-lg',
        'focus:ring-blue-500'
      ],
      accent: [
        'glass-gradient-accent',
        'glass-border-accent',
        'glass-shadow-lg',
        'glass-text-primary',
        'hover:glass-shadow-xl',
        'focus:ring-orange-500'
      ]
    };

    const sizeClasses = {
      sm: ['w-12', 'h-12', 'text-sm'],
      md: ['w-14', 'h-14', 'text-base'],
      lg: ['w-16', 'h-16', 'text-lg']
    };

    const positionClasses = {
      'bottom-right': ['bottom-6', 'right-6'],
      'bottom-left': ['bottom-6', 'left-6'],
      'top-right': ['top-6', 'right-6'],
      'top-left': ['top-6', 'left-6']
    };

    const iconSizeClasses = {
      sm: ['w-5', 'h-5'],
      md: ['w-6', 'h-6'],
      lg: ['w-7', 'h-7']
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      positionClasses[position],
      pulse && 'glass-pulse',
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-label={label}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn('border-2 border-current border-t-transparent rounded-full animate-spin', iconSizeClasses[size])} />
          </div>
        )}
        
        <div className={cn('flex items-center justify-center', loading && 'opacity-0', iconSizeClasses[size])}>
          {icon}
        </div>
      </button>
    );
  }
);

GlassFloatingButton.displayName = 'GlassFloatingButton';

export { GlassFloatingButton };
