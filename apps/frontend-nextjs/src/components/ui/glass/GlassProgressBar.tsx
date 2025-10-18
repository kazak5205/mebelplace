/**
 * GlassProgressBar - Прогресс бар с glass эффектом, smooth fill, animated
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  glassVariant?: 'primary' | 'secondary' | 'accent' | 'dark' | 'light';
  showLabel?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  label?: string;
  className?: string;
}

export const GlassProgressBar: React.FC<GlassProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  glassVariant = 'primary',
  showLabel = false,
  showPercentage = true,
  animated = true,
  striped = false,
  indeterminate = false,
  label,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Size classes
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  // Glass variant classes
  const glassClasses = {
    primary: 'bg-white/10 backdrop-blur-md border-white/20',
    secondary: 'bg-white/5 backdrop-blur-sm border-white/10',
    accent: 'bg-orange-500/20 backdrop-blur-md border-orange-500/30',
    dark: 'bg-black/20 backdrop-blur-lg border-white/5',
    light: 'bg-white/20 backdrop-blur-sm border-white/30',
  };

  // Progress variant classes
  const progressClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-400',
    secondary: 'bg-gradient-to-r from-gray-400 to-gray-300',
    success: 'bg-gradient-to-r from-green-500 to-green-400',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
    error: 'bg-gradient-to-r from-red-500 to-red-400',
    info: 'bg-gradient-to-r from-blue-500 to-blue-400',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {showLabel && (label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-white/80 text-sm font-medium">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-white/60 text-sm">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={cn(
          'relative overflow-hidden rounded-full border',
          glassClasses[glassVariant],
          sizeClasses[size]
        )}
      >
        {/* Progress Fill */}
        <motion.div
          className={cn(
            'h-full rounded-full relative',
            progressClasses[variant],
            striped && 'bg-stripes'
          )}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: indeterminate ? '100%' : `${percentage}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: 'easeOut',
          }}
        >
          {/* Striped Animation */}
          {striped && (
            <motion.div
              className="absolute inset-0 bg-stripes"
              animate={animated ? {
                backgroundPosition: ['0% 50%', '100% 50%'],
              } : {}}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}

          {/* Shimmer Effect */}
          {animated && !indeterminate && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}

          {/* Indeterminate Animation */}
          {indeterminate && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
        </motion.div>

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full shadow-lg"
          style={{
            boxShadow: `0 0 20px ${variant === 'primary' ? 'rgba(255, 102, 0, 0.3)' : 
                        variant === 'success' ? 'rgba(34, 197, 94, 0.3)' :
                        variant === 'warning' ? 'rgba(245, 158, 11, 0.3)' :
                        variant === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                        variant === 'info' ? 'rgba(59, 130, 246, 0.3)' :
                        'rgba(156, 163, 175, 0.3)'}`,
          }}
          animate={animated ? {
            opacity: [0.3, 0.8, 0.3],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
};

export default GlassProgressBar;
