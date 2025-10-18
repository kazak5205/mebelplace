'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassSliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'range' | 'dots' | 'gradient';
  disabled?: boolean;
  showLabels?: boolean;
  showValue?: boolean;
  showTicks?: boolean;
  showTooltip?: boolean;
  marks?: Array<{ value: number; label: string }>;
  className?: string;
  onChange?: (value: number) => void;
  onChangeCommitted?: (value: number) => void;
  formatValue?: (value: number) => string;
  tooltipFormat?: (value: number) => string;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  customColor?: string;
  animated?: boolean;
  smooth?: boolean;
}

// Size configurations
const sizeConfig = {
  sm: {
    trackHeight: 4,
    thumbSize: 16,
    thumbSizeActive: 20,
    spacing: 8
  },
  md: {
    trackHeight: 6,
    thumbSize: 20,
    thumbSizeActive: 24,
    spacing: 12
  },
  lg: {
    trackHeight: 8,
    thumbSize: 24,
    thumbSizeActive: 28,
    spacing: 16
  }
};

// Color configurations
const colorConfig = {
  primary: {
    track: 'bg-white/20',
    fill: 'bg-white/40',
    thumb: 'bg-white',
    thumbHover: 'bg-white/90'
  },
  secondary: {
    track: 'bg-white/10',
    fill: 'bg-white/20',
    thumb: 'bg-white/80',
    thumbHover: 'bg-white'
  },
  accent: {
    track: 'bg-orange-500/20',
    fill: 'bg-orange-500/40',
    thumb: 'bg-orange-500',
    thumbHover: 'bg-orange-400'
  },
  success: {
    track: 'bg-green-500/20',
    fill: 'bg-green-500/40',
    thumb: 'bg-green-500',
    thumbHover: 'bg-green-400'
  },
  warning: {
    track: 'bg-yellow-500/20',
    fill: 'bg-yellow-500/40',
    thumb: 'bg-yellow-500',
    thumbHover: 'bg-yellow-400'
  },
  error: {
    track: 'bg-red-500/20',
    fill: 'bg-red-500/40',
    thumb: 'bg-red-500',
    thumbHover: 'bg-red-400'
  }
};

export const GlassSlider: React.FC<GlassSliderProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  orientation = 'horizontal',
  size = 'md',
  variant = 'default',
  disabled = false,
  showLabels = true,
  showValue = true,
  showTicks = false,
  showTooltip = true,
  marks = [],
  className,
  onChange,
  onChangeCommitted,
  formatValue = (val) => val.toString(),
  tooltipFormat = (val) => val.toString(),
  color = 'accent',
  customColor,
  animated = true,
  smooth = true
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  
  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
  const config = sizeConfig[size];
  const colors = customColor ? {
    track: `bg-${customColor}/20`,
    fill: `bg-${customColor}/40`,
    thumb: `bg-${customColor}`,
    thumbHover: `bg-${customColor}/90`
  } : colorConfig[color];

  // Calculate percentage
  const percentage = ((currentValue - min) / (max - min)) * 100;

  // Motion values for smooth animations
  const x = useMotionValue(0);
  const scale = useTransform(x, [0, 1], [1, 1.2]);

  const handleValueChange = useCallback((newValue: number) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    const steppedValue = Math.round(clampedValue / step) * step;
    
    if (controlledValue === undefined) {
      setInternalValue(steppedValue);
    }
    onChange?.(steppedValue);
  }, [min, max, step, controlledValue, onChange]);

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    if (disabled) return;
    
    setIsDragging(true);
    
    if (orientation === 'horizontal') {
      const rect = sliderRef.current?.getBoundingClientRect();
      if (rect) {
        const newValue = min + ((info.point.x - rect.left) / rect.width) * (max - min);
        handleValueChange(newValue);
      }
    } else {
      const rect = sliderRef.current?.getBoundingClientRect();
      if (rect) {
        const newValue = max - ((info.point.y - rect.top) / rect.height) * (max - min);
        handleValueChange(newValue);
      }
    }
  }, [disabled, orientation, min, max, handleValueChange]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    onChangeCommitted?.(currentValue);
  }, [currentValue, onChangeCommitted]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let newValue: number;
    if (orientation === 'horizontal') {
      newValue = min + ((event.clientX - rect.left) / rect.width) * (max - min);
    } else {
      newValue = max - ((event.clientY - rect.top) / rect.height) * (max - min);
    }
    
    handleValueChange(newValue);
    onChangeCommitted?.(newValue);
  }, [disabled, orientation, min, max, handleValueChange, onChangeCommitted]);

  const getThumbPosition = () => {
    if (orientation === 'horizontal') {
      return { left: `${percentage}%`, top: '50%', transform: 'translate(-50%, -50%)' };
    } else {
      return { top: `${100 - percentage}%`, left: '50%', transform: 'translate(-50%, 50%)' };
    }
  };

  const getTrackFillStyle = () => {
    if (orientation === 'horizontal') {
      return { width: `${percentage}%` };
    } else {
      return { height: `${percentage}%` };
    }
  };

  const renderMarks = () => {
    if (!showTicks && marks.length === 0) return null;

    return (
      <div className={cn(
        'absolute',
        orientation === 'horizontal' 
          ? 'top-full left-0 right-0 mt-2' 
          : 'left-full top-0 bottom-0 ml-2'
      )}>
        {marks.map((mark) => {
          const markPercentage = ((mark.value - min) / (max - min)) * 100;
          const position = orientation === 'horizontal' 
            ? { left: `${markPercentage}%`, transform: 'translateX(-50%)' }
            : { top: `${100 - markPercentage}%`, transform: 'translateY(50%)' };
          
          return (
            <div
              key={mark.value}
              className="absolute text-xs text-white/60"
              style={position}
            >
              {mark.label}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTooltip = () => {
    if (!showTooltip || (!isHovered && !isDragging)) return null;

    return (
      <motion.div
        className={cn(
          'absolute z-10 px-2 py-1',
          'bg-glass-primary/90 backdrop-blur-xl',
          'border border-glass-border/50',
          'rounded-lg shadow-glass-md',
          'text-xs text-white font-medium'
        )}
        style={{
          ...(orientation === 'horizontal' 
            ? { left: `${percentage}%`, bottom: '100%', transform: 'translateX(-50%)', marginBottom: 8 }
            : { top: `${100 - percentage}%`, left: '100%', transform: 'translateY(-50%)', marginLeft: 8 }
          )
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {tooltipFormat(currentValue)}
      </motion.div>
    );
  };

  return (
    <div className={cn(
      'relative',
      orientation === 'horizontal' ? 'w-full' : 'h-full',
      className
    )}>
      {/* Labels */}
      {showLabels && (
        <div className={cn(
          'flex justify-between items-center mb-2',
          orientation === 'vertical' && 'flex-col h-full justify-between'
        )}>
          <span className="text-sm text-white/80">{formatValue(min)}</span>
          {showValue && (
            <span className="text-sm font-medium text-white">
              {formatValue(currentValue)}
            </span>
          )}
          <span className="text-sm text-white/80">{formatValue(max)}</span>
        </div>
      )}

      {/* Slider container */}
      <div
        ref={sliderRef}
        className={cn(
          'relative cursor-pointer',
          orientation === 'horizontal' 
            ? 'w-full' 
            : 'h-full w-6',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onClick={handleClick}
        onMouseEnter={() => {
          setIsHovered(true);
          setShowTooltipState(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltipState(false);
        }}
      >
        {/* Track */}
        <div
          className={cn(
            'absolute rounded-full',
            colors.track,
            orientation === 'horizontal' 
              ? 'w-full top-1/2 transform -translate-y-1/2' 
              : 'h-full left-1/2 transform -translate-x-1/2',
            `h-${config.trackHeight}`
          )}
          style={{
            [orientation === 'horizontal' ? 'height' : 'width']: config.trackHeight
          }}
        />

        {/* Fill */}
        <motion.div
          className={cn(
            'absolute rounded-full',
            colors.fill,
            orientation === 'horizontal' 
              ? 'top-1/2 transform -translate-y-1/2' 
              : 'left-1/2 transform -translate-x-1/2'
          )}
          style={{
            ...getTrackFillStyle(),
            [orientation === 'horizontal' ? 'height' : 'width']: config.trackHeight
          }}
          animate={animated ? getTrackFillStyle() : undefined}
          transition={smooth ? { duration: 0.2, ease: [0.4, 0, 0.2, 1] } : undefined}
        />

        {/* Thumb */}
        <motion.div
          ref={thumbRef}
          className={cn(
            'absolute rounded-full shadow-glass-md',
            'border-2 border-white/20',
            'cursor-grab active:cursor-grabbing',
            colors.thumb,
            disabled && 'cursor-not-allowed'
          )}
          style={{
            ...getThumbPosition(),
            width: isDragging ? config.thumbSizeActive : config.thumbSize,
            height: isDragging ? config.thumbSizeActive : config.thumbSize
          }}
          drag={orientation === 'horizontal' ? 'x' : 'y'}
          dragConstraints={sliderRef}
          dragElastic={0}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={animated ? {
            scale: isDragging ? 1.2 : 1,
            transition: { duration: 0.2 }
          } : undefined}
        >
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
        </motion.div>

        {/* Tooltip */}
        {renderTooltip()}

        {/* Marks */}
        {renderMarks()}
      </div>
    </div>
  );
};

// Convenience components
export const GlassRangeSlider: React.FC<{
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}> = ({ value, onChange, min = 0, max = 100, step = 1, size = 'md', color = 'accent' }) => {
  // This would be a more complex implementation for range sliders
  // For now, returning a simple dual-thumb slider
  return (
    <div className="space-y-4">
      <GlassSlider
        value={value[0]}
        onChange={(val) => onChange([val, value[1]])}
        min={min}
        max={value[1]}
        step={step}
        size={size}
        color={color}
        showValue
      />
      <GlassSlider
        value={value[1]}
        onChange={(val) => onChange([value[0], val])}
        min={value[0]}
        max={max}
        step={step}
        size={size}
        color={color}
        showValue
      />
    </div>
  );
};

export const GlassVolumeSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ value, onChange, size = 'md' }) => (
  <GlassSlider
    value={value}
    onChange={onChange}
    min={0}
    max={100}
    step={1}
    size={size}
    color="accent"
    formatValue={(val) => `${val}%`}
    showValue
    showTooltip
  />
);

export const GlassProgressSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}> = ({ value, onChange, size = 'md', color = 'success' }) => (
  <GlassSlider
    value={value}
    onChange={onChange}
    min={0}
    max={100}
    step={1}
    size={size}
    color={color}
    formatValue={(val) => `${val}%`}
    showValue
    variant="gradient"
  />
);

// Example usage component
export const GlassSliderExample: React.FC = () => {
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(75);
  const [range, setRange] = useState([20, 80] as [number, number]);

  return (
    <div className="space-y-8 p-8">
      {/* Basic sliders */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Базовые слайдеры</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-2">Громкость: {volume}%</label>
            <GlassSlider
              value={volume}
              onChange={setVolume}
              min={0}
              max={100}
              step={1}
              size="md"
              color="accent"
              showValue
              showTooltip
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-2">Яркость: {brightness}%</label>
            <GlassSlider
              value={brightness}
              onChange={setBrightness}
              min={0}
              max={100}
              step={5}
              size="lg"
              color="warning"
              showValue
              showTooltip
            />
          </div>
        </div>
      </div>

      {/* Different sizes */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Разные размеры</h3>
        
        <div className="space-y-4">
          <GlassSlider value={30} size="sm" color="primary" showValue />
          <GlassSlider value={50} size="md" color="accent" showValue />
          <GlassSlider value={70} size="lg" color="success" showValue />
        </div>
      </div>

      {/* Different colors */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Разные цвета</h3>
        
        <div className="space-y-4">
          <GlassSlider value={25} color="primary" showValue />
          <GlassSlider value={50} color="accent" showValue />
          <GlassSlider value={75} color="success" showValue />
          <GlassSlider value={90} color="warning" showValue />
          <GlassSlider value={60} color="error" showValue />
        </div>
      </div>

      {/* With marks */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">С метками</h3>
        
        <GlassSlider
          value={50}
          min={0}
          max={100}
          step={10}
          marks={[
            { value: 0, label: '0%' },
            { value: 25, label: '25%' },
            { value: 50, label: '50%' },
            { value: 75, label: '75%' },
            { value: 100, label: '100%' }
          ]}
          showTicks
          showValue
        />
      </div>

      {/* Range slider */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Диапазон: {range[0]} - {range[1]}</h3>
        
        <GlassRangeSlider
          value={range}
          onChange={setRange}
          min={0}
          max={100}
          step={5}
          size="md"
          color="accent"
        />
      </div>

      {/* Vertical slider */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Вертикальный слайдер</h3>
        
        <div className="flex items-center space-x-4">
          <div className="h-64">
            <GlassSlider
              value={60}
              orientation="vertical"
              size="md"
              color="accent"
              showValue
            />
          </div>
          <div className="text-white/80">
            <p>Вертикальный слайдер</p>
            <p className="text-sm">Идеально подходит для регулировки громкости или других параметров</p>
          </div>
        </div>
      </div>
    </div>
  );
};
