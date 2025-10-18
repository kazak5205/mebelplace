'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  separator?: boolean;
  badge?: string | number;
  onClick?: () => void;
}

export interface GlassDropdownProps {
  items: DropdownItem[];
  value?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  onItemClick?: (item: DropdownItem) => void;
  className?: string;
  variant?: 'default' | 'searchable' | 'multi-select';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxHeight?: number;
  position?: 'bottom' | 'top' | 'auto';
  align?: 'left' | 'right' | 'center';
  trigger?: React.ReactNode;
  showCheckmark?: boolean;
  closeOnSelect?: boolean;
}

// Animation variants
const dropdownVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: -10
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: -10,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassDropdown: React.FC<GlassDropdownProps> = ({
  items,
  value,
  placeholder = 'Выберите опцию',
  onValueChange,
  onItemClick,
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Поиск...',
  maxHeight = 300,
  position = 'auto',
  align = 'left',
  trigger,
  showCheckmark = true,
  closeOnSelect = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState(value || '');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    !item.separator && 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected item
  const selectedItem = items.find(item => item.value === selectedValue);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        event.preventDefault();
        // Focus next item
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Focus previous item
        break;
      case 'Enter':
        event.preventDefault();
        // Select focused item
        break;
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled || item.separator) return;

    setSelectedValue(item.value);
    onValueChange?.(item.value);
    onItemClick?.(item);
    item.onClick?.();

    if (closeOnSelect) {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          trigger: 'px-3 py-1.5 text-sm',
          item: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4'
        };
      case 'lg':
        return {
          trigger: 'px-4 py-3 text-lg',
          item: 'px-4 py-3 text-lg',
          icon: 'w-6 h-6'
        };
      default:
        return {
          trigger: 'px-3 py-2 text-base',
          item: 'px-3 py-2 text-base',
          icon: 'w-5 h-5'
        };
    }
  };

  const getPositionStyles = () => {
    const baseStyles = 'absolute z-50 w-full min-w-48';
    
    switch (position) {
      case 'top':
        return `${baseStyles} bottom-full mb-2`;
      case 'bottom':
        return `${baseStyles} top-full mt-2`;
      default:
        return `${baseStyles} top-full mt-2`;
    }
  };

  const getAlignStyles = () => {
    switch (align) {
      case 'right':
        return 'right-0';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      default:
        return 'left-0';
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)}>
          {trigger}
        </div>
      ) : (
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center justify-between w-full',
            'bg-glass-primary/80 backdrop-blur-xl',
            'border border-glass-border/50',
            'rounded-xl shadow-glass-sm',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:ring-offset-2 focus:ring-offset-transparent',
            sizeStyles.trigger,
            disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-glass-secondary/30 hover:border-glass-border cursor-pointer'
          )}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {selectedItem?.icon && (
              <selectedItem.icon className={cn(sizeStyles.icon, 'text-white/60 flex-shrink-0')} />
            )}
            <span className={cn(
              'truncate',
              selectedItem ? 'text-white' : 'text-white/60'
            )}>
              {selectedItem?.label || placeholder}
            </span>
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className={cn(sizeStyles.icon, 'text-white/60 flex-shrink-0')} />
          </motion.div>
        </button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              getPositionStyles(),
              getAlignStyles(),
              'bg-glass-primary/90 backdrop-blur-xl',
              'border border-glass-border/50',
              'rounded-2xl shadow-glass-lg',
              'overflow-hidden'
            )}
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ maxHeight }}
          >
            {/* Search */}
            {searchable && (
              <div className="p-3 border-b border-glass-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      'w-full pl-10 pr-3 py-2',
                      'bg-glass-secondary/30 border border-glass-border/30',
                      'rounded-lg text-white placeholder-white/60',
                      'focus:outline-none focus:ring-2 focus:ring-orange-400/50',
                      'transition-all duration-200'
                    )}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="max-h-60 overflow-y-auto">
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.separator ? (
                      <div className="h-px bg-glass-border/50 my-1" />
                    ) : (
                      <motion.button
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        className={cn(
                          'w-full flex items-center space-x-3',
                          'transition-all duration-200',
                          'focus:outline-none focus:bg-glass-accent/20',
                          sizeStyles.item,
                          item.disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-glass-secondary/30 cursor-pointer',
                          selectedValue === item.value && 'bg-glass-accent/20'
                        )}
                        whileHover={!item.disabled ? { x: 4 } : {}}
                        whileTap={!item.disabled ? { scale: 0.98 } : {}}
                      >
                        {/* Icon */}
                        {item.icon && (
                          <item.icon className={cn(
                            sizeStyles.icon,
                            selectedValue === item.value ? 'text-orange-400' : 'text-white/60'
                          )} />
                        )}

                        {/* Label */}
                        <span className={cn(
                          'flex-1 text-left',
                          selectedValue === item.value ? 'text-white font-medium' : 'text-white/80'
                        )}>
                          {item.label}
                        </span>

                        {/* Badge */}
                        {item.badge && (
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            'bg-orange-500/20 text-orange-300',
                            'border border-orange-500/30'
                          )}>
                            {item.badge}
                          </span>
                        )}

                        {/* Checkmark */}
                        {showCheckmark && selectedValue === item.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Check className="w-4 h-4 text-orange-400" />
                          </motion.div>
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* No results */}
              {searchable && filteredItems.length === 0 && searchQuery && (
                <div className="p-4 text-center text-white/60">
                  <p className="text-sm">Ничего не найдено</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Convenience components for common dropdown types
export const GlassSelect: React.FC<Omit<GlassDropdownProps, 'variant'>> = (props) => {
  return <GlassDropdown {...props} variant="default" />;
};

export const GlassSearchableDropdown: React.FC<Omit<GlassDropdownProps, 'variant' | 'searchable'>> = (props) => {
  return <GlassDropdown {...props} variant="searchable" searchable />;
};

// Example usage component
export const GlassDropdownExample: React.FC = () => {
  const items: DropdownItem[] = [
    {
      id: '1',
      label: 'Профиль',
      value: 'profile',
      icon: () => <div className="w-4 h-4 bg-blue-500 rounded-full" />
    },
    {
      id: '2',
      label: 'Настройки',
      value: 'settings',
      icon: () => <div className="w-4 h-4 bg-gray-500 rounded-full" />
    },
    {
      id: 'separator',
      label: '',
      value: '',
      separator: true
    },
    {
      id: '3',
      label: 'Выйти',
      value: 'logout',
      icon: () => <div className="w-4 h-4 bg-red-500 rounded-full" />
    }
  ];

  return (
    <div className="w-full max-w-xs">
      <GlassDropdown
        items={items}
        placeholder="Выберите действие"
        variant="default"
        size="md"
        showCheckmark
      />
    </div>
  );
};
