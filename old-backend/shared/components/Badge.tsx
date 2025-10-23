// Unified Badge Component для web и mobile
import React from 'react';
import { designTokens } from '../design-system/tokens';

export interface BadgeProps {
  count: number;
  max?: number;
  variant?: 'primary' | 'secondary' | 'error' | 'success' | 'warning';
  dot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  inline?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  max = 99,
  variant = 'primary',
  dot = false,
  size = 'md',
  children,
  className = '',
  position = 'top-right',
  inline = false,
}) => {
  const displayCount = count > max ? `${max}+` : count;
  const shouldShow = count > 0 || dot;

  const variants = {
    primary: 'bg-orange-500 text-white',
    secondary: 'bg-gray-500 text-white',
    error: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
  };

  const sizes = {
    sm: dot ? 'w-2 h-2' : 'min-w-[16px] h-4 text-[10px] px-1',
    md: dot ? 'w-2.5 h-2.5' : 'min-w-[20px] h-5 text-xs px-1.5',
    lg: dot ? 'w-3 h-3' : 'min-w-[24px] h-6 text-sm px-2',
  };

  const positions = {
    'top-right': 'top-0 right-0 transform translate-x-1/2 -translate-y-1/2',
    'top-left': 'top-0 left-0 transform -translate-x-1/2 -translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 transform translate-x-1/2 translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2',
  };

  const badgeElement = (
    <span
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${inline ? '' : 'absolute'}
        ${inline ? '' : positions[position]}
        inline-flex items-center justify-center
        rounded-full
        font-semibold
        shadow-sm
        ring-2 ring-white dark:ring-gray-900
        ${className}
      `}
    >
      {!dot && displayCount}
    </span>
  );

  // If no children, render badge inline
  if (!children || inline) {
    return shouldShow ? badgeElement : null;
  }

  // If children provided, render as positioned badge
  return (
    <div className="relative inline-block">
      {children}
      {shouldShow && badgeElement}
    </div>
  );
};

export default Badge;

