// Unified Divider Component для web и mobile
import React from 'react';
import { designTokens } from '../design-system/tokens';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  text?: string;
  textAlign?: 'left' | 'center' | 'right';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  text,
  textAlign = 'center',
  spacing = 'md',
  className = '',
}) => {
  const variants = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  const spacings = {
    none: '',
    sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
  };

  // Horizontal divider without text
  if (orientation === 'horizontal' && !text) {
    return (
      <hr
        className={`
          ${variants[variant]}
          ${spacings[spacing]}
          border-gray-200 dark:border-gray-700
          ${className}
        `}
      />
    );
  }

  // Horizontal divider with text
  if (orientation === 'horizontal' && text) {
    const alignments = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    return (
      <div
        className={`
          flex items-center
          ${spacings[spacing]}
          ${alignments[textAlign]}
          ${className}
        `}
      >
        {textAlign !== 'left' && (
          <div
            className={`
              flex-1 border-t
              ${variants[variant]}
              border-gray-200 dark:border-gray-700
              ${textAlign === 'center' ? '' : 'hidden'}
            `}
          />
        )}
        <span
          className={`
            px-3 text-sm font-medium text-gray-500 dark:text-gray-400
            whitespace-nowrap
          `}
        >
          {text}
        </span>
        {textAlign !== 'right' && (
          <div
            className={`
              flex-1 border-t
              ${variants[variant]}
              border-gray-200 dark:border-gray-700
            `}
          />
        )}
      </div>
    );
  }

  // Vertical divider
  if (orientation === 'vertical') {
    return (
      <div
        className={`
          border-l
          ${variants[variant]}
          ${spacings[spacing]}
          border-gray-200 dark:border-gray-700
          self-stretch
          ${className}
        `}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return null;
};

export default Divider;

