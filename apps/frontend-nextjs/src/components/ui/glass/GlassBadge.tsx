/**
 * GlassBadge - Бейдж с glass эффектом, scale анимацией
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  glassVariant?: 'primary' | 'secondary' | 'accent' | 'dark' | 'light';
  animation?: 'scale' | 'pulse' | 'bounce' | 'none';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  show?: boolean;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  glassVariant = 'primary',
  animation = 'scale',
  removable = false,
  onRemove,
  className,
  show = true,
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Glass variant classes
  const glassClasses = {
    primary: 'bg-white/10 backdrop-blur-md border-white/20',
    secondary: 'bg-white/5 backdrop-blur-sm border-white/10',
    accent: 'bg-orange-500/20 backdrop-blur-md border-orange-500/30',
    dark: 'bg-black/20 backdrop-blur-lg border-white/5',
    light: 'bg-white/20 backdrop-blur-sm border-white/30',
  };

  // Color variant classes
  const variantClasses = {
    default: 'text-white border-white/20',
    primary: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
    secondary: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
    success: 'text-green-500 border-green-500/30 bg-green-500/10',
    warning: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
    error: 'text-red-500 border-red-500/30 bg-red-500/10',
    info: 'text-blue-500 border-blue-500/30 bg-blue-500/10',
  };

  // Animation variants
  const animationVariants = {
    scale: {
      initial: { scale: 0 },
      animate: { scale: 1 },
      exit: { scale: 0 },
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    pulse: {
      animate: {
        scale: [1, 1.05, 1],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    bounce: {
      initial: { y: -10, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -10, opacity: 0 },
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
  };

  if (!show) return null;

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        glassClasses[glassVariant],
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      variants={animationVariants[animation]}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span>{children}</span>
      
      {removable && onRemove && (
        <motion.button
          onClick={onRemove}
          className="ml-1 rounded-full hover:bg-white/10 p-0.5 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
};

// Preset badge components
export const GlassStatusBadge: React.FC<{
  status: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}> = ({ status, className }) => {
  const statusConfig = {
    online: { variant: 'success' as const, children: 'Онлайн' },
    offline: { variant: 'secondary' as const, children: 'Офлайн' },
    away: { variant: 'warning' as const, children: 'Отошел' },
    busy: { variant: 'error' as const, children: 'Занят' },
  };

  return (
    <GlassBadge
      {...statusConfig[status]}
      size="sm"
      className={className}
    />
  );
};

export const GlassNotificationBadge: React.FC<{
  count: number;
  max?: number;
  className?: string;
}> = ({ count, max = 99, className }) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  if (count === 0) return null;

  return (
    <GlassBadge
      variant="error"
      size="sm"
      animation="pulse"
      className={cn('min-w-[20px] justify-center', className)}
    >
      {displayCount}
    </GlassBadge>
  );
};

export const GlassSkillBadge: React.FC<{
  skill: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  className?: string;
}> = ({ skill, level = 'intermediate', className }) => {
  const levelConfig = {
    beginner: { variant: 'info' as const },
    intermediate: { variant: 'primary' as const },
    advanced: { variant: 'warning' as const },
    expert: { variant: 'success' as const },
  };

  return (
    <GlassBadge
      {...levelConfig[level]}
      size="sm"
      className={className}
    >
      {skill}
    </GlassBadge>
  );
};

export const GlassCategoryBadge: React.FC<{
  category: string;
  className?: string;
}> = ({ category, className }) => (
  <GlassBadge
    variant="secondary"
    size="sm"
    className={className}
  >
    {category}
  </GlassBadge>
);

export default GlassBadge;
