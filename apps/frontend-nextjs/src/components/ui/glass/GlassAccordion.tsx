'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  defaultOpen?: boolean;
}

export interface GlassAccordionProps {
  items: AccordionItem[];
  variant?: 'default' | 'bordered' | 'flush' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  allowMultiple?: boolean;
  allowToggle?: boolean;
  className?: string;
  onItemToggle?: (itemId: string, isOpen: boolean) => void;
  onAllToggle?: (isOpen: boolean) => void;
  showExpandIcon?: boolean;
  expandIcon?: 'chevron' | 'plus' | 'none';
  animated?: boolean;
}

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-3',
    titleSize: 'text-sm',
    contentSize: 'text-sm',
    iconSize: 'w-4 h-4',
    spacing: 'space-y-1'
  },
  md: {
    padding: 'p-4',
    titleSize: 'text-base',
    contentSize: 'text-base',
    iconSize: 'w-5 h-5',
    spacing: 'space-y-2'
  },
  lg: {
    padding: 'p-6',
    titleSize: 'text-lg',
    contentSize: 'text-lg',
    iconSize: 'w-6 h-6',
    spacing: 'space-y-3'
  }
};

// Animation variants
const contentVariants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  open: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const iconVariants = {
  closed: {
    rotate: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  open: {
    rotate: 180,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const plusIconVariants = {
  closed: {
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  open: {
    rotate: 45,
    scale: 1.1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassAccordion: React.FC<GlassAccordionProps> = ({
  items,
  variant = 'default',
  size = 'md',
  allowMultiple = false,
  allowToggle = true,
  className,
  onItemToggle,
  onAllToggle,
  showExpandIcon = true,
  expandIcon = 'chevron',
  animated = true
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter(item => item.defaultOpen).map(item => item.id))
  );

  const config = sizeConfig[size];

  const handleItemClick = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.disabled) return;

    const isCurrentlyOpen = openItems.has(itemId);
    let newOpenItems: Set<string>;

    if (allowMultiple) {
      newOpenItems = new Set(openItems);
      if (isCurrentlyOpen && allowToggle) {
        newOpenItems.delete(itemId);
      } else {
        newOpenItems.add(itemId);
      }
    } else {
      if (isCurrentlyOpen && allowToggle) {
        newOpenItems = new Set();
      } else {
        newOpenItems = new Set([itemId]);
      }
    }

    setOpenItems(newOpenItems);
    onItemToggle?.(itemId, !isCurrentlyOpen);
  };

  const handleAllToggle = () => {
    const allOpen = openItems.size === items.length;
    const newOpenItems = allOpen ? new Set<string>() : new Set(items.map(item => item.id));
    setOpenItems(newOpenItems);
    onAllToggle?.(!allOpen);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'bordered':
        return {
          container: 'border border-glass-border/50 rounded-2xl overflow-hidden',
          item: 'border-b border-glass-border/30 last:border-b-0',
          header: 'bg-glass-primary/50',
          content: 'bg-glass-secondary/30'
        };
      case 'flush':
        return {
          container: '',
          item: '',
          header: 'bg-transparent',
          content: 'bg-transparent'
        };
      case 'cards':
        return {
          container: 'space-y-2',
          item: 'bg-glass-primary/50 border border-glass-border/50 rounded-2xl shadow-glass-sm',
          header: 'bg-transparent',
          content: 'bg-glass-secondary/30'
        };
      default:
        return {
          container: 'bg-glass-primary/50 border border-glass-border/50 rounded-2xl shadow-glass-sm overflow-hidden',
          item: '',
          header: 'bg-transparent',
          content: 'bg-glass-secondary/30'
        };
    }
  };

  const variantStyles = getVariantStyles();

  const renderExpandIcon = (isOpen: boolean) => {
    if (!showExpandIcon) return null;

    switch (expandIcon) {
      case 'plus':
        return (
          <motion.div
            variants={plusIconVariants}
            animate={isOpen ? 'open' : 'closed'}
            className="flex-shrink-0"
          >
            {isOpen ? (
              <Minus className={cn(config.iconSize, 'text-white/60')} />
            ) : (
              <Plus className={cn(config.iconSize, 'text-white/60')} />
            )}
          </motion.div>
        );
      case 'chevron':
        return (
          <motion.div
            variants={iconVariants}
            animate={isOpen ? 'open' : 'closed'}
            className="flex-shrink-0"
          >
            <ChevronDown className={cn(config.iconSize, 'text-white/60')} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* All toggle button */}
      {allowMultiple && (
        <div className="mb-4">
          <motion.button
            onClick={handleAllToggle}
            className={cn(
              'flex items-center justify-center w-full',
              'bg-glass-accent/20 hover:bg-glass-accent/30',
              'border border-glass-border/50',
              'rounded-xl transition-all duration-200',
              config.padding,
              config.titleSize,
              'text-white font-medium'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {openItems.size === items.length ? 'Свернуть все' : 'Развернуть все'}
          </motion.button>
        </div>
      )}

      {/* Accordion items */}
      <div className={cn(variantStyles.container, config.spacing)}>
        {items.map((item, index) => {
          const isOpen = openItems.has(item.id);
          const isDisabled = item.disabled;

          return (
            <motion.div
              key={item.id}
              className={cn(variantStyles.item)}
              initial={animated ? { opacity: 0, y: 20 } : undefined}
              animate={animated ? { opacity: 1, y: 0 } : undefined}
              transition={animated ? { delay: index * 0.1 } : undefined}
            >
              {/* Header */}
              <motion.button
                onClick={() => handleItemClick(item.id)}
                disabled={isDisabled}
                className={cn(
                  'w-full flex items-center justify-between',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:ring-offset-2 focus:ring-offset-transparent',
                  variantStyles.header,
                  config.padding,
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-glass-secondary/20 cursor-pointer'
                )}
                whileHover={!isDisabled ? { scale: 1.01 } : {}}
                whileTap={!isDisabled ? { scale: 0.99 } : {}}
              >
                {/* Left side */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Item icon */}
                  {item.icon && (
                    <item.icon className={cn(
                      config.iconSize,
                      isOpen ? 'text-orange-400' : 'text-white/60'
                    )} />
                  )}

                  {/* Title */}
                  <span className={cn(
                    'font-medium text-left',
                    config.titleSize,
                    isOpen ? 'text-white' : 'text-white/80',
                    isDisabled && 'text-white/40'
                  )}>
                    {item.title}
                  </span>

                  {/* Badge */}
                  {item.badge && (
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      'bg-orange-500/20 text-orange-300',
                      'border border-orange-500/30',
                      'flex-shrink-0'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Expand icon */}
                {renderExpandIcon(isOpen)}
              </motion.button>

              {/* Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className={cn(variantStyles.content)}
                    variants={animated ? contentVariants : undefined}
                    initial={animated ? 'closed' : undefined}
                    animate={animated ? 'open' : undefined}
                    exit={animated ? 'closed' : undefined}
                  >
                    <div className={cn(config.padding, 'pt-0')}>
                      <div className={cn(config.contentSize, 'text-white/80')}>
                        {item.content}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Convenience components
export const GlassSimpleAccordion: React.FC<{
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}> = ({ title, content, defaultOpen = false, icon }) => (
  <GlassAccordion
    items={[{
      id: 'single',
      title,
      content,
      defaultOpen,
      icon
    }]}
    variant="cards"
    allowMultiple={false}
    allowToggle={true}
  />
);

export const GlassFAQAccordion: React.FC<{
  questions: Array<{ question: string; answer: string }>;
}> = ({ questions }) => (
  <GlassAccordion
    items={questions.map((q, index) => ({
      id: `faq-${index}`,
      title: q.question,
      content: <p className="text-white/80">{q.answer}</p>
    }))}
    variant="bordered"
    allowMultiple={true}
    expandIcon="plus"
  />
);

export const GlassSettingsAccordion: React.FC<{
  sections: Array<{
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    settings: React.ReactNode;
  }>;
}> = ({ sections }) => (
  <GlassAccordion
    items={sections.map((section, index) => ({
      id: `settings-${index}`,
      title: section.title,
      content: section.settings,
      icon: section.icon
    }))}
    variant="cards"
    allowMultiple={true}
    size="lg"
  />
);

// Example usage component
export const GlassAccordionExample: React.FC = () => {
  const accordionItems: AccordionItem[] = [
    {
      id: 'general',
      title: 'Общие настройки',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            Здесь находятся основные настройки приложения, включая язык, тему и уведомления.
          </p>
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-white/80">Включить уведомления</span>
          </div>
        </div>
      ),
      icon: () => <div className="w-5 h-5 bg-blue-500 rounded-full" />,
      defaultOpen: true
    },
    {
      id: 'privacy',
      title: 'Конфиденциальность',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            Настройки конфиденциальности и безопасности вашего аккаунта.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Публичный профиль</span>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Показывать онлайн статус</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>
        </div>
      ),
      icon: () => <div className="w-5 h-5 bg-green-500 rounded-full" />,
      badge: '3'
    },
    {
      id: 'advanced',
      title: 'Расширенные настройки',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            Дополнительные параметры для опытных пользователей.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Качество видео</label>
              <select className="w-full p-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white">
                <option>720p</option>
                <option>1080p</option>
                <option>4K</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Частота кадров</label>
              <select className="w-full p-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white">
                <option>30 FPS</option>
                <option>60 FPS</option>
              </select>
            </div>
          </div>
        </div>
      ),
      icon: () => <div className="w-5 h-5 bg-purple-500 rounded-full" />,
      disabled: false
    }
  ];

  return (
    <div className="w-full max-w-2xl space-y-8 p-8">
      {/* Default variant */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Обычный аккордеон</h3>
        <GlassAccordion items={accordionItems} variant="default" />
      </div>

      {/* Bordered variant */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">С границами</h3>
        <GlassAccordion items={accordionItems} variant="bordered" />
      </div>

      {/* Cards variant */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Карточки</h3>
        <GlassAccordion items={accordionItems} variant="cards" allowMultiple />
      </div>

      {/* With plus icons */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">С плюсиками</h3>
        <GlassAccordion items={accordionItems} variant="bordered" expandIcon="plus" allowMultiple />
      </div>
    </div>
  );
};
