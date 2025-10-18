'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Search, 
  SlidersHorizontal,
  RotateCcw,
  Check,
  Plus,
  Minus
} from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
  selected?: boolean;
  disabled?: boolean;
}

export interface FilterGroup {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'range' | 'search' | 'select' | 'date';
  options?: FilterOption[];
  value?: any;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  expanded?: boolean;
}

export interface GlassFilterPanelProps {
  groups: FilterGroup[];
  onFiltersChange?: (filters: Record<string, any>) => void;
  onReset?: () => void;
  className?: string;
  variant?: 'default' | 'sidebar' | 'modal' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showReset?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  maxHeight?: number;
  collapsible?: boolean;
  animated?: boolean;
  sticky?: boolean;
}

// Animation variants
const panelVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const groupVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const optionVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassFilterPanel: React.FC<GlassFilterPanelProps> = ({
  groups,
  onFiltersChange,
  onReset,
  className,
  variant = 'default',
  size = 'md',
  showReset = true,
  showSearch = true,
  searchPlaceholder = 'Поиск фильтров...',
  maxHeight = 600,
  collapsible = true,
  animated = true,
  sticky = false
}) => {
  const [localGroups, setLocalGroups] = useState<FilterGroup[]>(groups);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter groups based on search query
  const filteredGroups = localGroups.filter(group => 
    !searchQuery || 
    group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.options?.some(option => 
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleGroupToggle = (groupId: string) => {
    if (!collapsible) return;
    
    setLocalGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, expanded: !group.expanded }
        : group
    ));
  };

  const handleOptionChange = (groupId: string, optionId: string, checked: boolean) => {
    const group = localGroups.find(g => g.id === groupId);
    if (!group) return;

    let newFilters = { ...filters };

    if (group.type === 'checkbox' || group.type === 'radio') {
      if (group.multiple) {
        const currentValues = filters[groupId] || [];
        newFilters[groupId] = checked
          ? [...currentValues, optionId]
          : currentValues.filter((id: string) => id !== optionId);
      } else {
        newFilters[groupId] = checked ? optionId : null;
      }
    } else {
      newFilters[groupId] = optionId;
    }

    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleRangeChange = (groupId: string, value: number) => {
    const newFilters = { ...filters, [groupId]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    setLocalGroups(groups);
    setSearchQuery('');
    onReset?.();
    onFiltersChange?.({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== null && value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const renderCheckboxGroup = (group: FilterGroup) => (
    <div className="space-y-2">
      {group.options?.map((option, index) => (
        <motion.label
          key={option.id}
          className={cn(
            'flex items-center space-x-3 p-2 rounded-lg cursor-pointer',
            'hover:bg-glass-secondary/20 transition-colors duration-200',
            option.disabled && 'opacity-50 cursor-not-allowed'
          )}
          variants={animated ? optionVariants : undefined}
          initial={animated ? 'hidden' : undefined}
          animate={animated ? 'visible' : undefined}
          transition={animated ? { delay: index * 0.05 } : undefined}
        >
          <div className="relative">
            <input
              type="checkbox"
              checked={filters[group.id]?.includes(option.id) || false}
              onChange={(e) => handleOptionChange(group.id, option.id, e.target.checked)}
              disabled={option.disabled}
              className="sr-only"
            />
            <div className={cn(
              'w-5 h-5 rounded border-2 border-glass-border/50',
              'flex items-center justify-center',
              'transition-all duration-200',
              filters[group.id]?.includes(option.id)
                ? 'bg-orange-500 border-orange-500'
                : 'bg-glass-secondary/30 hover:bg-glass-secondary/50'
            )}>
              {filters[group.id]?.includes(option.id) && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <span className={cn(
            'flex-1 text-sm',
            option.disabled ? 'text-white/40' : 'text-white/80'
          )}>
            {option.label}
          </span>
          {option.count !== undefined && (
            <span className="text-xs text-white/60 bg-glass-secondary/30 px-2 py-1 rounded-full">
              {option.count}
            </span>
          )}
        </motion.label>
      ))}
    </div>
  );

  const renderRadioGroup = (group: FilterGroup) => (
    <div className="space-y-2">
      {group.options?.map((option, index) => (
        <motion.label
          key={option.id}
          className={cn(
            'flex items-center space-x-3 p-2 rounded-lg cursor-pointer',
            'hover:bg-glass-secondary/20 transition-colors duration-200',
            option.disabled && 'opacity-50 cursor-not-allowed'
          )}
          variants={animated ? optionVariants : undefined}
          initial={animated ? 'hidden' : undefined}
          animate={animated ? 'visible' : undefined}
          transition={animated ? { delay: index * 0.05 } : undefined}
        >
          <div className="relative">
            <input
              type="radio"
              name={group.id}
              checked={filters[group.id] === option.id}
              onChange={(e) => handleOptionChange(group.id, option.id, e.target.checked)}
              disabled={option.disabled}
              className="sr-only"
            />
            <div className={cn(
              'w-5 h-5 rounded-full border-2 border-glass-border/50',
              'flex items-center justify-center',
              'transition-all duration-200',
              filters[group.id] === option.id
                ? 'bg-orange-500 border-orange-500'
                : 'bg-glass-secondary/30 hover:bg-glass-secondary/50'
            )}>
              {filters[group.id] === option.id && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
          </div>
          <span className={cn(
            'flex-1 text-sm',
            option.disabled ? 'text-white/40' : 'text-white/80'
          )}>
            {option.label}
          </span>
          {option.count !== undefined && (
            <span className="text-xs text-white/60 bg-glass-secondary/30 px-2 py-1 rounded-full">
              {option.count}
            </span>
          )}
        </motion.label>
      ))}
    </div>
  );

  const renderRangeGroup = (group: FilterGroup) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>{group.min || 0}</span>
        <span className="font-medium">{filters[group.id] || group.min || 0}</span>
        <span>{group.max || 100}</span>
      </div>
      <input
        type="range"
        min={group.min || 0}
        max={group.max || 100}
        step={group.step || 1}
        value={filters[group.id] || group.min || 0}
        onChange={(e) => handleRangeChange(group.id, Number(e.target.value))}
        className="w-full h-2 bg-glass-secondary/30 rounded-lg appearance-none cursor-pointer slider"
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ff6600;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ff6600;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );

  const renderSearchGroup = (group: FilterGroup) => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
      <input
        type="text"
        placeholder={group.placeholder || 'Поиск...'}
        value={filters[group.id] || ''}
        onChange={(e) => {
          const newFilters = { ...filters, [group.id]: e.target.value };
          setFilters(newFilters);
          onFiltersChange?.(newFilters);
        }}
        className="w-full pl-10 pr-4 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
      />
    </div>
  );

  const renderSelectGroup = (group: FilterGroup) => (
    <select
      value={filters[group.id] || ''}
      onChange={(e) => {
        const newFilters = { ...filters, [group.id]: e.target.value };
        setFilters(newFilters);
        onFiltersChange?.(newFilters);
      }}
      className="w-full p-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
    >
      <option value="">Выберите...</option>
      {group.options?.map(option => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const renderGroupContent = (group: FilterGroup) => {
    switch (group.type) {
      case 'checkbox':
        return renderCheckboxGroup(group);
      case 'radio':
        return renderRadioGroup(group);
      case 'range':
        return renderRangeGroup(group);
      case 'search':
        return renderSearchGroup(group);
      case 'select':
        return renderSelectGroup(group);
      default:
        return null;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'sidebar':
        return 'w-80 h-full';
      case 'modal':
        return 'w-full max-w-2xl max-h-96';
      case 'inline':
        return 'w-full';
      default:
        return 'w-full';
    }
  };

  return (
    <motion.div
      className={cn(
        'bg-glass-primary/80 backdrop-blur-xl',
        'border border-glass-border/50',
        'rounded-2xl shadow-glass-lg',
        'overflow-hidden',
        getVariantStyles(),
        sticky && 'sticky top-4',
        className
      )}
      variants={animated ? panelVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      {/* Header */}
      <div className="p-4 border-b border-glass-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Фильтры</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-300 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          {showReset && (
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-glass-secondary/20 rounded-lg transition-colors duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Сбросить</span>
            </button>
          )}
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              ref={searchRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="p-4 space-y-4" style={{ maxHeight, overflowY: 'auto' }}>
        <AnimatePresence>
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group.id}
              className="border-b border-glass-border/30 last:border-b-0 pb-4 last:pb-0"
              initial={animated ? { opacity: 0, y: 20 } : undefined}
              animate={animated ? { opacity: 1, y: 0 } : undefined}
              transition={animated ? { delay: index * 0.1 } : undefined}
            >
              {/* Group Header */}
              <button
                onClick={() => handleGroupToggle(group.id)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg',
                  'hover:bg-glass-secondary/20 transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-orange-400/50'
                )}
              >
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-white/60" />
                  <span className="font-medium text-white">{group.title}</span>
                </div>
                {collapsible && (
                  <motion.div
                    animate={{ rotate: group.expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-white/60" />
                  </motion.div>
                )}
              </button>

              {/* Group Content */}
              <AnimatePresence>
                {(!collapsible || group.expanded) && (
                  <motion.div
                    variants={animated ? groupVariants : undefined}
                    initial={animated ? 'collapsed' : undefined}
                    animate={animated ? 'expanded' : undefined}
                    exit={animated ? 'collapsed' : undefined}
                    className="mt-3"
                  >
                    {renderGroupContent(group)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* No results */}
        {filteredGroups.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <p className="text-white/60">Фильтры не найдены</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Convenience components
export const GlassSearchFilter: React.FC<{
  placeholder?: string;
  onSearch: (query: string) => void;
  value?: string;
}> = ({ placeholder = 'Поиск...', onSearch, value }) => (
  <GlassFilterPanel
    groups={[{
      id: 'search',
      title: 'Поиск',
      type: 'search',
      placeholder
    }]}
    onFiltersChange={(filters) => onSearch(filters.search || '')}
  />
);

export const GlassCategoryFilter: React.FC<{
  categories: Array<{ id: string; name: string; count?: number }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
}> = ({ categories, selected, onChange, multiple = true }) => (
  <GlassFilterPanel
    groups={[{
      id: 'categories',
      title: 'Категории',
      type: multiple ? 'checkbox' : 'radio',
      options: categories.map(cat => ({
        id: cat.id,
        value: cat.id,
        label: cat.name,
        count: cat.count,
        selected: selected.includes(cat.id)
      })),
      multiple
    }]}
    onFiltersChange={(filters) => onChange(filters.categories || [])}
  />
);

export const GlassPriceFilter: React.FC<{
  min?: number;
  max?: number;
  value?: number;
  onChange: (value: number) => void;
}> = ({ min = 0, max = 10000, value, onChange }) => (
  <GlassFilterPanel
    groups={[{
      id: 'price',
      title: 'Цена',
      type: 'range',
      min,
      max,
      step: 100
    }]}
    onFiltersChange={(filters) => onChange(filters.price || min)}
  />
);

// Example usage component
export const GlassFilterPanelExample: React.FC = () => {
  const sampleGroups: FilterGroup[] = [
    {
      id: 'category',
      title: 'Категория',
      type: 'checkbox',
      multiple: true,
      expanded: true,
      options: [
        { id: 'kitchen', value: 'kitchen', label: 'Кухни', count: 24 },
        { id: 'bedroom', value: 'bedroom', label: 'Спальни', count: 18 },
        { id: 'living', value: 'living', label: 'Гостиные', count: 32 },
        { id: 'office', value: 'office', label: 'Офисы', count: 12 }
      ]
    },
    {
      id: 'price',
      title: 'Цена',
      type: 'range',
      min: 0,
      max: 50000,
      step: 1000,
      expanded: true
    },
    {
      id: 'rating',
      title: 'Рейтинг',
      type: 'radio',
      multiple: false,
      expanded: true,
      options: [
        { id: '5', value: '5', label: '5 звезд' },
        { id: '4', value: '4', label: '4+ звезды' },
        { id: '3', value: '3', label: '3+ звезды' }
      ]
    },
    {
      id: 'location',
      title: 'Местоположение',
      type: 'select',
      expanded: false,
      options: [
        { id: 'almaty', value: 'almaty', label: 'Алматы' },
        { id: 'astana', value: 'astana', label: 'Астана' },
        { id: 'shymkent', value: 'shymkent', label: 'Шымкент' }
      ]
    }
  ];

  return (
    <div className="w-full max-w-md">
      <GlassFilterPanel
        groups={sampleGroups}
        onFiltersChange={(filters) => console.log('Filters:', filters)}
        variant="default"
        showReset
        showSearch
        collapsible
        animated
      />
    </div>
  );
};



