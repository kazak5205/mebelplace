'use client';

/**
 * Language Switcher Component
 * Allows users to switch between RU, KZ, EN languages with flag emojis
 */

import { useLocale } from 'next-intl';
import { useState, useTransition, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { Button } from '@/components/ui';

const FLAGS: Record<Locale, string> = {
  ru: '🇷🇺',
  kz: '🇰🇿',
  en: '🇬🇧',
};

const GlobeIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: '16px', height: '16px' }}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    startTransition(() => {
      // Remove current locale prefix from pathname
      const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
      
      // Add new locale prefix
      const newPathname = `/${newLocale}${pathnameWithoutLocale}`;
      
      // Navigate to the new locale path
      router.push(newPathname);
      router.refresh();
      setIsOpen(false);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        icon={<GlobeIcon />}
        aria-label="Change language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          minHeight: '40px',
        }}
      >
        <span style={{ fontSize: '20px' }}>{FLAGS[locale]}</span>
        <span className="hidden sm:inline" style={{ fontSize: '14px' }}>
          {localeNames[locale]}
        </span>
      </Button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            minWidth: '160px',
            backgroundColor: 'white',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {locales.map((loc) => {
            const isActive = loc === locale;
            return (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                disabled={isPending}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  border: 'none',
                  background: isActive ? 'rgba(255, 102, 0, 0.1)' : 'transparent',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isPending) {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>{FLAGS[loc]}</span>
                <span style={{ flex: 1 }}>{localeNames[loc]}</span>
                {isActive && (
                  <span style={{ color: '#FF6600', fontWeight: 'bold' }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

