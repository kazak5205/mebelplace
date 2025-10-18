'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, X, Sun, Moon, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';

export interface GlassSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'icon' | 'label' | 'custom';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  customColor?: string;
  label?: string;
  description?: string;
  icon?: {
    checked: React.ComponentType<{ className?: string }>;
    unchecked: React.ComponentType<{ className?: string }>;
  };
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
  id?: string;
  name?: string;
  value?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Size configurations
const sizeConfig = {
  sm: {
    width: 36,
    height: 20,
    thumbSize: 16,
    padding: 2,
    iconSize: 10
  },
  md: {
    width: 44,
    height: 24,
    thumbSize: 20,
    padding: 2,
    iconSize: 12
  },
  lg: {
    width: 52,
    height: 28,
    thumbSize: 24,
    padding: 2,
    iconSize: 14
  }
};

// Color configurations
const colorConfig = {
  primary: {
    checked: 'bg-white/40',
    unchecked: 'bg-white/20',
    thumb: 'bg-white',
    thumbHover: 'bg-white/90'
  },
  secondary: {
    checked: 'bg-white/30',
    unchecked: 'bg-white/10',
    thumb: 'bg-white/80',
    thumbHover: 'bg-white'
  },
  accent: {
    checked: 'bg-orange-500/40',
    unchecked: 'bg-white/20',
    thumb: 'bg-orange-500',
    thumbHover: 'bg-orange-400'
  },
  success: {
    checked: 'bg-green-500/40',
    unchecked: 'bg-white/20',
    thumb: 'bg-green-500',
    thumbHover: 'bg-green-400'
  },
  warning: {
    checked: 'bg-yellow-500/40',
    unchecked: 'bg-white/20',
    thumb: 'bg-yellow-500',
    thumbHover: 'bg-yellow-400'
  },
  error: {
    checked: 'bg-red-500/40',
    unchecked: 'bg-white/20',
    thumb: 'bg-red-500',
    thumbHover: 'bg-red-400'
  }
};

// Animation variants
const switchVariants = {
  unchecked: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  checked: {
    backgroundColor: 'rgba(255, 102, 0, 0.4)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const thumbVariants = {
  unchecked: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  checked: {
    x: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const iconVariants = {
  unchecked: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  checked: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassSwitch: React.FC<GlassSwitchProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  color = 'accent',
  customColor,
  label,
  description,
  icon,
  showIcon = false,
  animated = true,
  className,
  id,
  name,
  value,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const switchRef = useRef<HTMLButtonElement>(null);
  
  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;
  const config = sizeConfig[size];
  const colors = customColor ? {
    checked: `bg-${customColor}/40`,
    unchecked: 'bg-white/20',
    thumb: `bg-${customColor}`,
    thumbHover: `bg-${customColor}/90`
  } : colorConfig[color];

  const handleToggle = () => {
    if (disabled) return;
    
    const newChecked = !isChecked;
    
    if (controlledChecked === undefined) {
      setInternalChecked(newChecked);
    }
    
    onChange?.(newChecked);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleToggle();
    }
  };

  const getThumbPosition = () => {
    const maxTranslate = config.width - config.thumbSize - (config.padding * 2);
    return isChecked ? maxTranslate : 0;
  };

  const renderIcon = () => {
    if (!showIcon && !icon) return null;

    const IconComponent = icon 
      ? (isChecked ? icon.checked : icon.unchecked)
      : (isChecked ? Check : X);

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={isChecked ? 'checked' : 'unchecked'}
          variants={animated ? iconVariants : undefined}
          initial={animated ? 'unchecked' : undefined}
          animate={animated ? 'checked' : undefined}
          exit={animated ? 'unchecked' : undefined}
          className="absolute inset-0 flex items-center justify-center"
        >
          <IconComponent 
            className={cn(
              'text-white',
              `w-${config.iconSize} h-${config.iconSize}`
            )}
          />
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderSwitch = () => (
    <motion.button
      ref={switchRef}
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-disabled={disabled}
      aria-label={ariaLabel || label}
      aria-describedby={ariaDescribedby}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative inline-flex items-center rounded-full',
        'bg-glass-primary/30 backdrop-blur-sm',
        'border border-glass-border/50',
        'shadow-glass-sm',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:ring-offset-2 focus:ring-offset-transparent',
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:shadow-glass-md',
        className
      )}
      style={{
        width: config.width,
        height: config.height,
        padding: config.padding
      }}
      variants={animated ? switchVariants : undefined}
      animate={animated ? (isChecked ? 'checked' : 'unchecked') : undefined}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {/* Track background */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          isChecked ? colors.checked : colors.unchecked,
          'transition-colors duration-300'
        )}
      />

      {/* Thumb */}
      <motion.div
        className={cn(
          'relative rounded-full shadow-glass-sm',
          'border border-white/20',
          colors.thumb,
          isHovered && !disabled && colors.thumbHover
        )}
        style={{
          width: config.thumbSize,
          height: config.thumbSize
        }}
        variants={animated ? thumbVariants : undefined}
        animate={animated ? {
          x: getThumbPosition(),
          transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        } : undefined}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.9 } : {}}
      >
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
        
        {/* Icon */}
        {renderIcon()}
      </motion.div>

      {/* Focus ring */}
      {isFocused && (
        <motion.div
          className="absolute inset-0 rounded-full ring-2 ring-orange-400/50 ring-offset-2 ring-offset-transparent"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        />
      )}
    </motion.button>
  );

  if (variant === 'label' && (label || description)) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'block text-sm font-medium',
                disabled ? 'text-white/40' : 'text-white cursor-pointer'
              )}
            >
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </label>
          )}
          {description && (
            <p className={cn(
              'text-xs mt-1',
              disabled ? 'text-white/30' : 'text-white/60'
            )}>
              {description}
            </p>
          )}
        </div>
        {renderSwitch()}
      </div>
    );
  }

  return renderSwitch();
};

// Convenience components
export const GlassToggle: React.FC<Omit<GlassSwitchProps, 'variant'>> = (props) => (
  <GlassSwitch {...props} variant="default" />
);

export const GlassIconSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: {
    checked: React.ComponentType<{ className?: string }>;
    unchecked: React.ComponentType<{ className?: string }>;
  };
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}> = ({ icon, ...props }) => (
  <GlassSwitch {...props} variant="icon" icon={icon} showIcon />
);

export const GlassThemeSwitch: React.FC<{
  isDark: boolean;
  onChange: (isDark: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isDark, onChange, size = 'md' }) => (
  <GlassIconSwitch
    checked={isDark}
    onChange={onChange}
    icon={{
      checked: Moon,
      unchecked: Sun
    }}
    size={size}
    color="accent"
  />
);

export const GlassWifiSwitch: React.FC<{
  isConnected: boolean;
  onChange: (isConnected: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isConnected, onChange, size = 'md' }) => (
  <GlassIconSwitch
    checked={isConnected}
    onChange={onChange}
    icon={{
      checked: Wifi,
      unchecked: WifiOff
    }}
    size={size}
    color={isConnected ? 'success' : 'error'}
  />
);

export const GlassVolumeSwitch: React.FC<{
  isMuted: boolean;
  onChange: (isMuted: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isMuted, onChange, size = 'md' }) => (
  <GlassIconSwitch
    checked={!isMuted}
    onChange={(checked) => onChange(!checked)}
    icon={{
      checked: Volume2,
      unchecked: VolumeX
    }}
    size={size}
    color="accent"
  />
);

export const GlassLabelSwitch: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}> = (props) => (
  <GlassSwitch {...props} variant="label" />
);

// Example usage component
export const GlassSwitchExample: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [volume, setVolume] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="space-y-8 p-8">
      {/* Basic switches */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Базовые переключатели</h3>
        
        <div className="flex items-center space-x-4">
          <GlassSwitch
            checked={notifications}
            onChange={setNotifications}
            size="sm"
            color="primary"
          />
          <GlassSwitch
            checked={autoSave}
            onChange={setAutoSave}
            size="md"
            color="accent"
          />
          <GlassSwitch
            checked={darkMode}
            onChange={setDarkMode}
            size="lg"
            color="success"
          />
        </div>
      </div>

      {/* Different colors */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Разные цвета</h3>
        
        <div className="flex items-center space-x-4">
          <GlassSwitch checked={true} color="primary" />
          <GlassSwitch checked={true} color="accent" />
          <GlassSwitch checked={true} color="success" />
          <GlassSwitch checked={true} color="warning" />
          <GlassSwitch checked={true} color="error" />
        </div>
      </div>

      {/* With labels */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">С подписями</h3>
        
        <div className="space-y-4">
          <GlassLabelSwitch
            label="Push уведомления"
            description="Получать уведомления о новых сообщениях"
            checked={notifications}
            onChange={setNotifications}
          />
          
          <GlassLabelSwitch
            label="Автосохранение"
            description="Автоматически сохранять изменения"
            checked={autoSave}
            onChange={setAutoSave}
          />
          
          <GlassLabelSwitch
            label="Темная тема"
            description="Использовать темную тему интерфейса"
            checked={darkMode}
            onChange={setDarkMode}
          />
        </div>
      </div>

      {/* Icon switches */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">С иконками</h3>
        
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <GlassThemeSwitch
              isDark={darkMode}
              onChange={setDarkMode}
              size="lg"
            />
            <p className="text-sm text-white/60 mt-2">Тема</p>
          </div>
          
          <div className="text-center">
            <GlassWifiSwitch
              isConnected={wifi}
              onChange={setWifi}
              size="lg"
            />
            <p className="text-sm text-white/60 mt-2">WiFi</p>
          </div>
          
          <div className="text-center">
            <GlassVolumeSwitch
              isMuted={!volume}
              onChange={setVolume}
              size="lg"
            />
            <p className="text-sm text-white/60 mt-2">Звук</p>
          </div>
        </div>
      </div>

      {/* Disabled states */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Отключенные состояния</h3>
        
        <div className="flex items-center space-x-4">
          <GlassSwitch checked={false} disabled />
          <GlassSwitch checked={true} disabled />
          <GlassLabelSwitch
            label="Отключенная опция"
            description="Эта опция недоступна"
            checked={false}
            onChange={() => {}}
            disabled
          />
        </div>
      </div>

      {/* Required fields */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Обязательные поля</h3>
        
        <div className="space-y-4">
          <GlassLabelSwitch
            label="Согласие с условиями"
            description="Я согласен с условиями использования"
            checked={false}
            onChange={() => {}}
            required
          />
          
          <GlassLabelSwitch
            label="Подписка на рассылку"
            description="Получать новости и обновления"
            checked={false}
            onChange={() => {}}
            required
          />
        </div>
      </div>
    </div>
  );
};
