'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bars' | 'ring' | 'dots-bounce' | 'wave';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'orange';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
  label?: string;
  showLabel?: boolean;
}

// Size configurations
const sizeConfig = {
  sm: { size: 16, stroke: 2 },
  md: { size: 24, stroke: 2.5 },
  lg: { size: 32, stroke: 3 },
  xl: { size: 48, stroke: 4 }
};

// Color configurations
const colorConfig = {
  primary: 'text-white',
  secondary: 'text-white/60',
  accent: 'text-orange-400',
  white: 'text-white',
  orange: 'text-orange-500'
};

// Speed configurations
const speedConfig = {
  slow: 2,
  normal: 1,
  fast: 0.5
};

// Animation variants
const rotationVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

const bounceVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

const waveVariants = {
  animate: {
    scaleY: [1, 1.5, 1],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

// Default spinner (ring)
export const GlassSpinner: React.FC<GlassSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  color = 'accent',
  speed = 'normal',
  className,
  label = 'Загрузка...',
  showLabel = false
}) => {
  const config = sizeConfig[size];
  const colorClass = colorConfig[color];
  const duration = speedConfig[speed];

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner config={config} colorClass={colorClass} duration={duration} />;
      case 'pulse':
        return <PulseSpinner config={config} colorClass={colorClass} duration={duration} />;
      case 'bars':
        return <BarsSpinner config={config} colorClass={colorClass} duration={duration} />;
      case 'ring':
        return <RingSpinner config={config} colorClass={colorClass} duration={duration} />;
      case 'dots-bounce':
        return <DotsBounceSpinner config={config} colorClass={colorClass} duration={duration} />;
      case 'wave':
        return <WaveSpinner config={config} colorClass={colorClass} duration={duration} />;
      default:
        return <DefaultSpinner config={config} colorClass={colorClass} duration={duration} />;
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative">
        {renderSpinner()}
      </div>
      {showLabel && (
        <motion.p
          className={cn('mt-2 text-sm font-medium', colorClass)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
};

// Default spinner (ring with glass effect)
const DefaultSpinner: React.FC<{
  config: { size: number; stroke: number };
  colorClass: string;
  duration: number;
}> = ({ config, colorClass, duration }) => {
  return (
    <div className="relative">
      {/* Glass background */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-glass-primary/30 backdrop-blur-sm',
          'border border-glass-border/50'
        )}
        style={{ width: config.size, height: config.size }}
      />
      
      {/* Spinning ring */}
      <motion.div
        className="relative"
        style={{ width: config.size, height: config.size }}
        variants={rotationVariants}
        animate="animate"
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        <svg
          width={config.size}
          height={config.size}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute inset-0"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray="60 40"
            strokeDashoffset="0"
            className={cn('opacity-20', colorClass)}
          />
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray="60 40"
            strokeDashoffset="60"
            className={colorClass}
            initial={{ strokeDashoffset: 60 }}
            animate={{ strokeDashoffset: -60 }}
            transition={{ duration, ease: 'linear', repeat: Infinity }}
          />
        </svg>
      </motion.div>
    </div>
  );
};

// Dots spinner
const DotsSpinner: React.FC<{
  config: { size: number; stroke: number };
  colorClass: string;
  duration: number;
}> = ({ config, colorClass, duration }) => {
  const dotSize = config.size / 8;
  
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn('rounded-full', colorClass)}
          style={{ width: dotSize, height: dotSize }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: duration,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );
};

// Pulse spinner
const PulseSpinner: React.FC<{
  config: { size: number; stroke: number };
  colorClass: string;
  duration: number;
}> = ({ config, colorClass, duration }) => {
  return (
    <motion.div
      className={cn(
        'rounded-full',
        'bg-glass-primary/30 backdrop-blur-sm',
        'border border-glass-border/50',
        colorClass
      )}
      style={{ width: config.size, height: config.size }}
      variants={pulseVariants}
      animate="animate"
      transition={{ duration: duration * 1.5, ease: 'easeInOut', repeat: Infinity }}
    />
  );
};

// Bars spinner
const BarsSpinner: React.FC<{
  config: { size: number; stroke: number };
  colorClass: string;
  duration: number;
}> = ({ config, colorClass, duration }) => {
  const barWidth = config.size / 6;
  const barHeight = config.size;
  
  return (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={cn('rounded-full', colorClass)}
          style={{ width: barWidth, height: barHeight * (0.3 + (index % 3) * 0.2) }}
          animate={{
            scaleY: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: duration,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  );
};

// Ring spinner
const RingSpinner: React.FC<{
  config: { size: number; stroke: number };
  colorClass: string;
  duration: number;
}> = ({ config, colorClass, duration }) => {
  return (
    <motion.div
      className="relative"
      style={{ width: config.size, height: config.size }}
      variants={rotationVariants}
      animate="animate"
      transition={{ duration, ease: 'linear', repeat: Infinity }}
    >
      <svg
        width={config.size}
        height={config.size}
        viewBox="0 0 24 24"
        fill="none"
        className="absolute inset-0"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray="80 20"
          strokeDashoffset="0"
          className={cn('opacity-20', colorClass)}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray="80 20"
          strokeDashoffset="80"
          className={colorClass}
          initial={{ strokeDashoffset: 80 }}
          animate={{ strokeDashoffset: -80 }}
          transition={{ duration, ease: 'linear', repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
};

// Dots bounce spinner
const DotsBounceSpinner: React.FC<{
  config: { size: number; stroke: number };
  colorClass: string;
  duration: number;
}> = ({ config, colorClass, duration }) => {
  const dotSize = config.size / 6;
  
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn('rounded-full', colorClass)}
          style={{ width: dotSize, height: dotSize }}
          variants={bounceVariants}
          animate="animate"
          transition={{
            duration: duration * 0.6,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  );
};

// Wave spinner
const WaveSpinner: React.FC<{
  config: { size: number; stroke: number };
  colorClass: string;
  duration: number;
}> = ({ config, colorClass, duration }) => {
  const barWidth = config.size / 8;
  const barHeight = config.size;
  
  return (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={cn('rounded-full', colorClass)}
          style={{ width: barWidth, height: barHeight * 0.6 }}
          variants={waveVariants}
          animate="animate"
          transition={{
            duration: duration * 0.8,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  );
};

// Convenience components
export const GlassLoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => (
  <GlassSpinner size={size} variant="default" color="accent" showLabel />
);

export const GlassButtonSpinner: React.FC = () => (
  <GlassSpinner size="sm" variant="dots" color="white" />
);

export const GlassPageSpinner: React.FC<{ label?: string }> = ({ label = 'Загрузка страницы...' }) => (
  <div className="flex items-center justify-center min-h-screen">
    <GlassSpinner size="xl" variant="ring" color="accent" label={label} showLabel />
  </div>
);

export const GlassInlineSpinner: React.FC = () => (
  <GlassSpinner size="sm" variant="pulse" color="accent" />
);

// Example usage component
export const GlassSpinnerExample: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8">
      <div className="text-center">
        <GlassSpinner variant="default" size="lg" />
        <p className="mt-2 text-sm text-white/80">Default</p>
      </div>
      <div className="text-center">
        <GlassSpinner variant="dots" size="lg" />
        <p className="mt-2 text-sm text-white/80">Dots</p>
      </div>
      <div className="text-center">
        <GlassSpinner variant="pulse" size="lg" />
        <p className="mt-2 text-sm text-white/80">Pulse</p>
      </div>
      <div className="text-center">
        <GlassSpinner variant="bars" size="lg" />
        <p className="mt-2 text-sm text-white/80">Bars</p>
      </div>
      <div className="text-center">
        <GlassSpinner variant="ring" size="lg" />
        <p className="mt-2 text-sm text-white/80">Ring</p>
      </div>
      <div className="text-center">
        <GlassSpinner variant="dots-bounce" size="lg" />
        <p className="mt-2 text-sm text-white/80">Dots Bounce</p>
      </div>
      <div className="text-center">
        <GlassSpinner variant="wave" size="lg" />
        <p className="mt-2 text-sm text-white/80">Wave</p>
      </div>
      <div className="text-center">
        <GlassSpinner variant="default" size="lg" showLabel label="Загрузка..." />
        <p className="mt-2 text-sm text-white/80">With Label</p>
      </div>
    </div>
  );
};
