// Unified EmptyState Component для web и mobile
import React from 'react';
import { designTokens } from '../design-system/tokens';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  size = 'md',
  className = '',
}) => {
  const DefaultIcon = () => (
    <svg
      className="mx-auto text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  const sizes = {
    sm: {
      container: 'py-8',
      icon: 'w-10 h-10 mb-3',
      title: 'text-base',
      description: 'text-sm',
      spacing: 'space-y-2',
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12 mb-4',
      title: 'text-lg',
      description: 'text-base',
      spacing: 'space-y-3',
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16 mb-6',
      title: 'text-xl',
      description: 'text-lg',
      spacing: 'space-y-4',
    },
  };

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        text-center
        ${sizes[size].container}
        ${className}
      `}
    >
      <div className={`${sizes[size].spacing} max-w-md mx-auto px-4`}>
        {/* Icon */}
        <div className={sizes[size].icon}>
          {icon || <DefaultIcon />}
        </div>

        {/* Title */}
        <h3
          className={`
            ${sizes[size].title}
            font-semibold
            text-gray-900 dark:text-white
          `}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className={`
              ${sizes[size].description}
              text-gray-500 dark:text-gray-400
              mt-2
            `}
          >
            {description}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <div className="mt-6">
            <Button
              onClick={action.onClick}
              variant={action.variant || 'primary'}
              size={size}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

