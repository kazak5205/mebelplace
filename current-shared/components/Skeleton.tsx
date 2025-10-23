// Unified Skeleton Component для web и mobile
import React from 'react';
import { designTokens } from '../design-system/tokens';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave';
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  animation = 'pulse',
  className = '',
  count = 1,
}) => {
  const formatDimension = (value: string | number | undefined): string => {
    if (value === undefined) return '';
    return typeof value === 'number' ? `${value}px` : value;
  };

  const baseStyles = `
    bg-gray-200 dark:bg-gray-700
    overflow-hidden
    relative
    ${animation === 'pulse' ? 'animate-pulse' : ''}
  `;

  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const getDefaultWidth = () => {
    if (width) return formatDimension(width);
    if (variant === 'circular') return formatDimension(height) || '40px';
    return '100%';
  };

  const getDefaultHeight = () => {
    if (height) return formatDimension(height);
    if (variant === 'circular') return formatDimension(width) || '40px';
    if (variant === 'text') return '1em';
    return '100px';
  };

  const style = {
    width: getDefaultWidth(),
    height: getDefaultHeight(),
  };

  const SkeletonElement = () => (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${className}
      `}
      style={style}
    >
      {animation === 'wave' && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </div>
  );

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonElement key={index} />
        ))}
      </div>
    );
  }

  return <SkeletonElement />;
};

// Add shimmer animation style if not already present
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
  `;
  if (!document.getElementById('skeleton-animations')) {
    style.id = 'skeleton-animations';
    document.head.appendChild(style);
  }
}

export default Skeleton;

