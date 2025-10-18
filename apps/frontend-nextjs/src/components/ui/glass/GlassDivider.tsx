'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassDividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'gradient' | 'dashed' | 'dotted' | 'thick' | 'thin' | 'glow';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'gray' | 'custom';
  customColor?: string;
  size?: 'sm' | 'md' | 'lg';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  showIcon?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}

// Size configurations
const sizeConfig = {
  sm: { thickness: 1, spacing: 8 },
  md: { thickness: 2, spacing: 16 },
  lg: { thickness: 3, spacing: 24 }
};

// Spacing configurations
const spacingConfig = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

// Color configurations
const colorConfig = {
  primary: 'border-white/20',
  secondary: 'border-white/10',
  accent: 'border-orange-400/30',
  white: 'border-white/30',
  gray: 'border-gray-400/30',
  custom: ''
};

// Gradient configurations
const gradientConfig = {
  primary: 'bg-gradient-to-r from-transparent via-white/20 to-transparent',
  secondary: 'bg-gradient-to-r from-transparent via-white/10 to-transparent',
  accent: 'bg-gradient-to-r from-transparent via-orange-400/30 to-transparent',
  white: 'bg-gradient-to-r from-transparent via-white/30 to-transparent',
  gray: 'bg-gradient-to-r from-transparent via-gray-400/30 to-transparent'
};

// Animation variants
const dividerVariants = {
  initial: {
    scaleX: 0,
    opacity: 0
  },
  animate: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const verticalDividerVariants = {
  initial: {
    scaleY: 0,
    opacity: 0
  },
  animate: {
    scaleY: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const glowVariants = {
  animate: {
    boxShadow: [
      '0 0 5px rgba(255, 102, 0, 0.3)',
      '0 0 20px rgba(255, 102, 0, 0.6)',
      '0 0 5px rgba(255, 102, 0, 0.3)'
    ],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

export const GlassDivider: React.FC<GlassDividerProps> = ({
  orientation = 'horizontal',
  variant = 'default',
  color = 'primary',
  customColor,
  size = 'md',
  spacing = 'md',
  className,
  animated = false,
  label,
  labelPosition = 'center',
  showIcon = false,
  icon: Icon,
  children
}) => {
  const config = sizeConfig[size];
  const spacingValue = spacingConfig[spacing];
  const colorClass = color === 'custom' ? '' : colorConfig[color];
  const gradientClass = color === 'custom' ? '' : gradientConfig[color];

  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: gradientClass,
          border: 'none',
          height: orientation === 'horizontal' ? config.thickness : '100%',
          width: orientation === 'vertical' ? config.thickness : '100%'
        };
      case 'dashed':
        return {
          borderStyle: 'dashed',
          borderWidth: orientation === 'horizontal' ? `0 0 ${config.thickness}px 0` : `0 0 0 ${config.thickness}px`,
          borderColor: customColor || 'rgba(255, 255, 255, 0.2)',
          background: 'none'
        };
      case 'dotted':
        return {
          borderStyle: 'dotted',
          borderWidth: orientation === 'horizontal' ? `0 0 ${config.thickness}px 0` : `0 0 0 ${config.thickness}px`,
          borderColor: customColor || 'rgba(255, 255, 255, 0.2)',
          background: 'none'
        };
      case 'thick':
        return {
          background: customColor || 'rgba(255, 255, 255, 0.3)',
          border: 'none',
          height: orientation === 'horizontal' ? config.thickness * 2 : '100%',
          width: orientation === 'vertical' ? config.thickness * 2 : '100%'
        };
      case 'thin':
        return {
          background: customColor || 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          height: orientation === 'horizontal' ? 1 : '100%',
          width: orientation === 'vertical' ? 1 : '100%'
        };
      case 'glow':
        return {
          background: customColor || 'rgba(255, 102, 0, 0.5)',
          border: 'none',
          height: orientation === 'horizontal' ? config.thickness : '100%',
          width: orientation === 'vertical' ? config.thickness : '100%',
          boxShadow: '0 0 10px rgba(255, 102, 0, 0.5)'
        };
      default:
        return {
          background: customColor || 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          height: orientation === 'horizontal' ? config.thickness : '100%',
          width: orientation === 'vertical' ? config.thickness : '100%'
        };
    }
  };

  const variantStyles = getVariantStyles();

  const renderDivider = () => {
    const dividerElement = (
      <motion.div
        className={cn(
          'relative',
          orientation === 'horizontal' ? 'w-full' : 'h-full',
          colorClass
        )}
        style={variantStyles}
        variants={variant === 'glow' && animated ? glowVariants : (orientation === 'horizontal' ? dividerVariants : verticalDividerVariants)}
        initial={animated ? 'initial' : undefined}
        animate={animated ? 'animate' : undefined}
      >
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      </motion.div>
    );

    if (!label && !children && !showIcon) {
      return dividerElement;
    }

    return (
      <div className={cn(
        'flex items-center',
        orientation === 'horizontal' ? 'w-full' : 'h-full flex-col',
        spacingValue > 0 && (orientation === 'horizontal' ? `my-${spacingValue/4}` : `mx-${spacingValue/4}`)
      )}>
        {/* Left/Top content */}
        {(labelPosition === 'left' || labelPosition === 'center') && (
          <div className={cn(
            'flex items-center',
            orientation === 'horizontal' ? 'flex-1' : 'flex-1 w-full justify-center'
          )}>
            {orientation === 'horizontal' ? dividerElement : null}
          </div>
        )}

        {/* Label/Icon/Children */}
        <div className={cn(
          'flex items-center space-x-2 px-4',
          orientation === 'horizontal' ? 'flex-shrink-0' : 'flex-shrink-0 w-full justify-center'
        )}>
          {showIcon && Icon && (
            <Icon className="w-4 h-4 text-white/60" />
          )}
          {label && (
            <span className="text-sm text-white/60 font-medium whitespace-nowrap">
              {label}
            </span>
          )}
          {children}
        </div>

        {/* Right/Bottom content */}
        {(labelPosition === 'right' || labelPosition === 'center') && (
          <div className={cn(
            'flex items-center',
            orientation === 'horizontal' ? 'flex-1' : 'flex-1 w-full justify-center'
          )}>
            {orientation === 'horizontal' ? dividerElement : null}
          </div>
        )}
      </div>
    );
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn(
        'flex items-center justify-center',
        spacingValue > 0 && `mx-${spacingValue/4}`,
        className
      )}>
        {renderDivider()}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center',
      spacingValue > 0 && `my-${spacingValue/4}`,
      className
    )}>
      {renderDivider()}
    </div>
  );
};

// Convenience components
export const GlassHorizontalDivider: React.FC<Omit<GlassDividerProps, 'orientation'>> = (props) => (
  <GlassDivider {...props} orientation="horizontal" />
);

export const GlassVerticalDivider: React.FC<Omit<GlassDividerProps, 'orientation'>> = (props) => (
  <GlassDivider {...props} orientation="vertical" />
);

export const GlassGradientDivider: React.FC<Omit<GlassDividerProps, 'variant'>> = (props) => (
  <GlassDivider {...props} variant="gradient" />
);

export const GlassDashedDivider: React.FC<Omit<GlassDividerProps, 'variant'>> = (props) => (
  <GlassDivider {...props} variant="dashed" />
);

export const GlassGlowDivider: React.FC<Omit<GlassDividerProps, 'variant'>> = (props) => (
  <GlassDivider {...props} variant="glow" animated />
);

// Section divider with label
export const GlassSectionDivider: React.FC<{
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: GlassDividerProps['variant'];
  color?: GlassDividerProps['color'];
}> = ({ title, icon, variant = 'gradient', color = 'accent' }) => (
  <GlassDivider
    variant={variant}
    color={color}
    label={title}
    labelPosition="center"
    showIcon={!!icon}
    icon={icon}
    size="md"
    spacing="lg"
  />
);

// Example usage component
export const GlassDividerExample: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      {/* Horizontal dividers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Горизонтальные разделители</h3>
        
        <div className="space-y-4">
          <GlassDivider variant="default" size="sm" />
          <GlassDivider variant="gradient" size="md" color="accent" />
          <GlassDivider variant="dashed" size="lg" color="white" />
          <GlassDivider variant="dotted" size="md" color="secondary" />
          <GlassDivider variant="thick" size="lg" color="accent" />
          <GlassDivider variant="thin" size="sm" color="primary" />
          <GlassDivider variant="glow" size="md" color="accent" animated />
        </div>
      </div>

      {/* Vertical dividers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Вертикальные разделители</h3>
        
        <div className="flex items-center space-x-4 h-20">
          <div className="text-white">Левая часть</div>
          <GlassDivider orientation="vertical" variant="gradient" size="md" />
          <div className="text-white">Правая часть</div>
        </div>
      </div>

      {/* Dividers with labels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Разделители с подписями</h3>
        
        <div className="space-y-4">
          <GlassDivider 
            variant="gradient" 
            label="Раздел 1" 
            labelPosition="center" 
            color="accent" 
          />
          <GlassDivider 
            variant="dashed" 
            label="Раздел 2" 
            labelPosition="left" 
            color="white" 
          />
          <GlassDivider 
            variant="glow" 
            label="Раздел 3" 
            labelPosition="right" 
            color="accent" 
            animated 
          />
        </div>
      </div>

      {/* Section dividers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Разделители секций</h3>
        
        <div className="space-y-4">
          <GlassSectionDivider title="Основные настройки" variant="gradient" />
          <GlassSectionDivider title="Дополнительные опции" variant="dashed" />
          <GlassSectionDivider title="Системные параметры" variant="glow" />
        </div>
      </div>

      {/* Custom spacing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Разные отступы</h3>
        
        <div className="space-y-4">
          <GlassDivider variant="default" spacing="none" />
          <GlassDivider variant="default" spacing="sm" />
          <GlassDivider variant="default" spacing="md" />
          <GlassDivider variant="default" spacing="lg" />
          <GlassDivider variant="default" spacing="xl" />
        </div>
      </div>
    </div>
  );
};
