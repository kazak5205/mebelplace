/**
 * GlassSkeleton - Скелетон загрузки с glass эффектом, shimmer animation
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassSkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | 'none';
  glassVariant?: 'primary' | 'secondary' | 'accent' | 'dark' | 'light';
  lines?: number;
  spacing?: 'sm' | 'md' | 'lg';
}

export const GlassSkeleton: React.FC<GlassSkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
  glassVariant = 'primary',
  lines = 1,
  spacing = 'md',
}) => {
  // Glass variant classes
  const glassClasses = {
    primary: 'bg-white/8 backdrop-blur-sm',
    secondary: 'bg-white/5 backdrop-blur-sm',
    accent: 'bg-orange-500/10 backdrop-blur-sm',
    dark: 'bg-black/10 backdrop-blur-sm',
    light: 'bg-white/12 backdrop-blur-sm',
  };

  // Spacing classes
  const spacingClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  // Variant classes
  const variantClasses = {
    text: 'h-4 w-full',
    rectangular: 'w-full',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  };

  // Animation variants
  const animationVariants = {
    pulse: {
      animate: {
        opacity: [0.4, 0.8, 0.4],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    wave: {
      animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
    none: {},
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  // Single skeleton element
  const SkeletonElement = () => (
    <motion.div
      className={cn(
        'overflow-hidden',
        glassClasses[glassVariant],
        variantClasses[variant],
        className
      )}
      style={style}
      variants={animationVariants[animation]}
      animate={animation !== 'none' ? 'animate' : undefined}
      {...(animation === 'wave' && {
        style: {
          ...style,
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          backgroundSize: '200% 100%',
        },
      })}
    >
      {animation === 'wave' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
  );

  // Multiple lines skeleton
  if (lines > 1) {
    return (
      <div className={cn('flex flex-col', spacingClasses[spacing])}>
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonElement key={index} />
        ))}
      </div>
    );
  }

  return <SkeletonElement />;
};

// Preset skeleton components for common use cases
export const GlassSkeletonText: React.FC<Omit<GlassSkeletonProps, 'variant'>> = (props) => (
  <GlassSkeleton {...props} variant="text" />
);

export const GlassSkeletonAvatar: React.FC<Omit<GlassSkeletonProps, 'variant' | 'width' | 'height'>> = (props) => (
  <GlassSkeleton {...props} variant="circular" width={40} height={40} />
);

export const GlassSkeletonCard: React.FC<Omit<GlassSkeletonProps, 'variant' | 'lines'>> = (props) => (
  <div className="space-y-3">
    <GlassSkeleton {...props} variant="rectangular" height={200} />
    <GlassSkeleton {...props} variant="text" width="80%" />
    <GlassSkeleton {...props} variant="text" width="60%" />
  </div>
);

export const GlassSkeletonList: React.FC<Omit<GlassSkeletonProps, 'variant' | 'lines'>> = ({ lines = 5, ...props }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className="flex items-center gap-3">
        <GlassSkeletonAvatar {...props} />
        <div className="flex-1 space-y-2">
          <GlassSkeleton {...props} variant="text" width="70%" />
          <GlassSkeleton {...props} variant="text" width="50%" />
        </div>
      </div>
    ))}
  </div>
);

export const GlassSkeletonTable: React.FC<Omit<GlassSkeletonProps, 'variant' | 'lines'>> = ({ lines = 5, ...props }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className="flex gap-4">
        <GlassSkeleton {...props} variant="text" width="20%" />
        <GlassSkeleton {...props} variant="text" width="30%" />
        <GlassSkeleton {...props} variant="text" width="25%" />
        <GlassSkeleton {...props} variant="text" width="15%" />
        <GlassSkeleton {...props} variant="text" width="10%" />
      </div>
    ))}
  </div>
);

export default GlassSkeleton;
