import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon: React.ReactNode;
  label?: string;
}

const GlassIconButton = React.forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    label,
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
      'disabled:glass-disabled',
      'rounded-full'
    ];

    const variantClasses = {
      primary: [
        'glass-bg-primary',
        'glass-border',
        'glass-shadow-base',
        'glass-text-primary',
        'hover:glass-shadow-md',
        'focus:ring-orange-500'
      ],
      secondary: [
        'glass-bg-secondary',
        'glass-border',
        'glass-shadow-sm',
        'glass-text-primary',
        'hover:glass-shadow-base',
        'focus:ring-blue-500'
      ],
      ghost: [
        'bg-transparent',
        'border-transparent',
        'glass-text-primary',
        'hover:glass-bg-primary',
        'focus:ring-purple-500'
      ],
      accent: [
        'glass-gradient-accent',
        'glass-border-accent',
        'glass-shadow-md',
        'glass-text-primary',
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
      sm: ['w-8', 'h-8', 'text-sm'],
      md: ['w-10', 'h-10', 'text-base'],
      lg: ['w-12', 'h-12', 'text-lg'],
      xl: ['w-14', 'h-14', 'text-xl']
    };

    const iconSizeClasses = {
      sm: ['w-4', 'h-4'],
      md: ['w-5', 'h-5'],
      lg: ['w-6', 'h-6'],
      xl: ['w-7', 'h-7']
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

GlassIconButton.displayName = 'GlassIconButton';

export { GlassIconButton };
