// Unified Avatar Component для web и mobile
import React, { useState } from 'react';
import { designTokens } from '../design-system/tokens';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  online?: boolean;
  shape?: 'circle' | 'rounded' | 'square';
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  fallback,
  online,
  shape = 'circle',
  className = '',
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Generate initials from name
  const getInitials = (name: string): string => {
    if (fallback) return fallback;
    
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Generate consistent color from name
  const getBackgroundColor = (name: string): string => {
    const colors = [
      'bg-orange-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const shapes = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none',
  };

  const onlineSizes = {
    xs: 'w-1.5 h-1.5 border',
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-3.5 h-3.5 border-2',
    '2xl': 'w-4 h-4 border-2',
  };

  const showImage = src && !imageError;
  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);

  return (
    <div
      className={`
        relative inline-block
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      <div
        className={`
          ${sizes[size]}
          ${shapes[shape]}
          ${showImage ? 'bg-gray-200 dark:bg-gray-700' : `${bgColor} text-white`}
          flex items-center justify-center
          overflow-hidden
          font-semibold
          transition-all duration-200
          ${onClick ? 'hover:opacity-80 hover:scale-105' : ''}
          ${className}
        `}
      >
        {showImage ? (
          <img
            src={src?.startsWith('http') ? src : `https://mebelplace.com.kz${src}`}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => {
              console.log('Avatar image failed to load:', src);
              setImageError(true);
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Online status indicator */}
      {online !== undefined && (
        <div
          className={`
            absolute bottom-0 right-0
            ${onlineSizes[size]}
            ${online ? 'bg-green-500' : 'bg-gray-400'}
            rounded-full
            border-white dark:border-gray-900
            ring-1 ring-white dark:ring-gray-900
          `}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default Avatar;

