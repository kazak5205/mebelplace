/**
 * LanguageSwitcher - Переключатель языков с Glass UI
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { GlassButton } from './glass/GlassButton';
import { GlassCard } from './glass/GlassCard';
import { GlassTooltip } from './glass/GlassTooltip';
import { cn } from '@/lib/utils';
import { locales, type Locale, i18nUtils } from '@/i18n/config';

export interface LanguageSwitcherProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
  className?: string;
  variant?: 'button' | 'dropdown' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showFlags?: boolean;
  showNames?: boolean;
  showTooltip?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLocale,
  onLocaleChange,
  className,
  variant = 'dropdown',
  size = 'md',
  showFlags = true,
  showNames = true,
  showTooltip = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (locale: Locale) => {
    onLocaleChange(locale);
    setIsOpen(false);
  };

  const currentLanguage = i18nUtils.getLanguageName(currentLocale);
  const currentFlag = i18nUtils.getLanguageFlag(currentLocale);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Button variant
  if (variant === 'button') {
    return (
      <div className={cn('relative', className)}>
        <GlassTooltip
          content={`Текущий язык: ${currentLanguage}`}
          isDisabled={!showTooltip}
        >
          <GlassButton
            onClick={() => setIsOpen(!isOpen)}
            variant="secondary"
            size={size}
            className="gap-2"
          >
            {showFlags && <span className={sizeClasses[size]}>{currentFlag}</span>}
            {showNames && <span>{currentLanguage}</span>}
            <ChevronDown className={cn(iconSizes[size], isOpen && 'rotate-180')} />
          </GlassButton>
        </GlassTooltip>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute top-full left-0 mt-2 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard className="min-w-[200px] p-2">
                {locales.map((locale) => (
                  <motion.button
                    key={locale}
                    onClick={() => handleLocaleChange(locale)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      'hover:bg-white/5 text-left',
                      currentLocale === locale && 'bg-white/10'
                    )}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {showFlags && (
                      <span className={sizeClasses[size]}>
                        {i18nUtils.getLanguageFlag(locale)}
                      </span>
                    )}
                    
                    <span className={cn('flex-1', sizeClasses[size])}>
                      {i18nUtils.getLanguageName(locale)}
                    </span>
                    
                    {currentLocale === locale && (
                      <Check className={cn(iconSizes[size], 'text-orange-500')} />
                    )}
                  </motion.button>
                ))}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {locales.map((locale, index) => (
          <React.Fragment key={locale}>
            <GlassButton
              onClick={() => handleLocaleChange(locale)}
              variant={currentLocale === locale ? 'primary' : 'secondary'}
              size={size}
              className={cn(
                'min-w-[40px] px-2',
                currentLocale === locale && 'bg-orange-500/20 border-orange-500/30'
              )}
            >
              {showFlags && (
                <span className={sizeClasses[size]}>
                  {i18nUtils.getLanguageFlag(locale)}
                </span>
              )}
              {showNames && (
                <span className="ml-1">{i18nUtils.getLanguageName(locale)}</span>
              )}
            </GlassButton>
            {index < locales.length - 1 && (
              <div className="w-px h-4 bg-white/20" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={cn('relative', className)}>
      <GlassTooltip
        content={`Текущий язык: ${currentLanguage}`}
        isDisabled={!showTooltip}
      >
        <GlassButton
          onClick={() => setIsOpen(!isOpen)}
          variant="secondary"
          size={size}
          className="gap-2 min-w-[120px] justify-between"
        >
          <div className="flex items-center gap-2">
            {showFlags && <span className={sizeClasses[size]}>{currentFlag}</span>}
            {showNames && <span>{currentLanguage}</span>}
          </div>
          <ChevronDown 
            className={cn(
              iconSizes[size], 
              'transition-transform duration-200',
              isOpen && 'rotate-180'
            )} 
          />
        </GlassButton>
      </GlassTooltip>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              className="absolute top-full left-0 mt-2 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard className="min-w-[200px] p-2 shadow-lg">
                <div className="space-y-1">
                  {locales.map((locale) => (
                    <motion.button
                      key={locale}
                      onClick={() => handleLocaleChange(locale)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                        'hover:bg-white/5 text-left group',
                        currentLocale === locale 
                          ? 'bg-orange-500/20 border border-orange-500/30' 
                          : 'hover:border-white/10'
                      )}
                      whileHover={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        scale: 1.02 
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {showFlags && (
                        <span className={cn(sizeClasses[size], 'flex-shrink-0')}>
                          {i18nUtils.getLanguageFlag(locale)}
                        </span>
                      )}
                      
                      <span className={cn('flex-1', sizeClasses[size])}>
                        {i18nUtils.getLanguageName(locale)}
                      </span>
                      
                      {currentLocale === locale && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className={cn(iconSizes[size], 'text-orange-500')} />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Preset компоненты для разных случаев использования
export const CompactLanguageSwitcher: React.FC<Omit<LanguageSwitcherProps, 'variant'>> = (props) => (
  <LanguageSwitcher {...props} variant="inline" showNames={false} showTooltip={false} />
);

export const FullLanguageSwitcher: React.FC<Omit<LanguageSwitcherProps, 'variant'>> = (props) => (
  <LanguageSwitcher {...props} variant="dropdown" showFlags={true} showNames={true} showTooltip={true} />
);

export const MobileLanguageSwitcher: React.FC<Omit<LanguageSwitcherProps, 'variant'>> = (props) => (
  <LanguageSwitcher {...props} variant="button" size="sm" showNames={false} />
);

export default LanguageSwitcher;