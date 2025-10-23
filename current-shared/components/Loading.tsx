// Unified Loading Component для web и mobile
import React from 'react';
import { designTokens } from '../design-system/tokens';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className = '',
}) => {
  const sizes = {
    sm: {
      spinner: 'w-5 h-5',
      dot: 'w-2 h-2',
      pulse: 'w-8 h-8',
    },
    md: {
      spinner: 'w-8 h-8',
      dot: 'w-3 h-3',
      pulse: 'w-12 h-12',
    },
    lg: {
      spinner: 'w-12 h-12',
      dot: 'w-4 h-4',
      pulse: 'w-16 h-16',
    },
  };

  const SpinnerVariant = () => (
    <svg
      className={`animate-spin ${sizes[size].spinner} text-orange-500`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const DotsVariant = () => (
    <div className="flex space-x-2">
      <div
        className={`${sizes[size].dot} bg-orange-500 rounded-full animate-bounce`}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={`${sizes[size].dot} bg-orange-500 rounded-full animate-bounce`}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={`${sizes[size].dot} bg-orange-500 rounded-full animate-bounce`}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );

  const PulseVariant = () => (
    <div className="relative">
      <div
        className={`${sizes[size].pulse} bg-orange-500 rounded-full animate-ping absolute opacity-75`}
      />
      <div
        className={`${sizes[size].pulse} bg-orange-600 rounded-full animate-pulse`}
      />
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return <SpinnerVariant />;
      case 'dots':
        return <DotsVariant />;
      case 'pulse':
        return <PulseVariant />;
      default:
        return <SpinnerVariant />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {renderVariant()}
      {text && (
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[1700] flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;

