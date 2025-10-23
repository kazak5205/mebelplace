// Unified Card Component для web и mobile
import React from 'react';
import { designTokens } from '../design-system/tokens';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'default',
  padding = 'md',
  fullWidth = false,
  hover = false,
}) => {
  const baseStyles = `
    rounded-lg
    transition-all duration-300
    ${fullWidth ? 'w-full' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${hover && onClick ? 'transform hover:scale-[1.02]' : ''}
  `;

  const variants = {
    default: `
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      shadow-sm
      ${hover && onClick ? 'hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700' : ''}
    `,
    glass: `
      bg-white/80 dark:bg-gray-800/80
      backdrop-blur-xl
      border border-gray-200/50 dark:border-gray-700/50
      shadow-lg shadow-orange-500/10
      ${hover && onClick ? 'hover:shadow-xl hover:shadow-orange-500/20 hover:border-orange-300/70 dark:hover:border-orange-700/70' : ''}
    `,
    elevated: `
      bg-white dark:bg-gray-800
      shadow-xl
      border-none
      ${hover && onClick ? 'hover:shadow-2xl' : ''}
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;

