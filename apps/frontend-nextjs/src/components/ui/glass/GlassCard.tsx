import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'basic' | 'elevated' | 'interactive' | 'feature';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  loading?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    variant = 'basic', 
    padding = 'md',
    hover = false,
    loading = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = [
      'glass-transition',
      'relative',
      'overflow-hidden',
      'rounded-xl'
    ];

    const variantClasses = {
      basic: [
        'glass-bg-primary',
        'glass-border',
        'glass-shadow-sm'
      ],
      elevated: [
        'glass-bg-primary',
        'glass-border',
        'glass-shadow-md'
      ],
      interactive: [
        'glass-bg-primary',
        'glass-border',
        'glass-shadow-base',
        'cursor-pointer',
        'hover:glass-shadow-lg',
        'hover:transform',
        'hover:-translate-y-1'
      ],
      feature: [
        'glass-gradient-primary',
        'glass-border',
        'glass-shadow-lg',
        'cursor-pointer',
        'hover:glass-shadow-xl',
        'hover:transform',
        'hover:-translate-y-2'
      ]
    };

    const paddingClasses = {
      none: [],
      sm: ['p-3'],
      md: ['p-4'],
      lg: ['p-6'],
      xl: ['p-8']
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      hover && 'hover:glass-shadow-lg hover:transform hover:-translate-y-1',
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {loading && (
          <div className="absolute inset-0 glass-loading" />
        )}
        <div className={cn('relative', loading && 'opacity-50')}>
          {children}
        </div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Card Sub-components
export interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCardHeader = React.forwardRef<HTMLDivElement, GlassCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

GlassCardHeader.displayName = 'GlassCardHeader';

export interface GlassCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const GlassCardTitle = React.forwardRef<HTMLHeadingElement, GlassCardTitleProps>(
  ({ className, level = 3, children, ...props }, ref) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    
    return React.createElement(
      Tag,
      {
        ref,
        className: cn(
          'glass-text-primary font-semibold text-xl mb-2',
          className
        ),
        ...props
      },
      children
    );
  }
);

GlassCardTitle.displayName = 'GlassCardTitle';

export interface GlassCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCardContent = React.forwardRef<HTMLDivElement, GlassCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('glass-text-secondary', className)}
      {...props}
    >
      {children}
    </div>
  )
);

GlassCardContent.displayName = 'GlassCardContent';

export interface GlassCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCardFooter = React.forwardRef<HTMLDivElement, GlassCardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-white/10', className)}
      {...props}
    >
      {children}
    </div>
  )
);

GlassCardFooter.displayName = 'GlassCardFooter';

export { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassCardFooter 
};
