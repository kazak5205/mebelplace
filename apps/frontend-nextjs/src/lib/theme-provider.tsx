'use client';

/**
 * Theme Provider - Dark/Light Mode Management
 * Uses cookies for SSR support and localStorage as fallback
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'mebelplace-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Get system theme preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Resolve theme (system -> actual theme)
  const resolveTheme = useCallback(
    (themeValue: Theme): 'light' | 'dark' => {
      return themeValue === 'system' ? getSystemTheme() : themeValue;
    },
    [getSystemTheme]
  );

  // Apply theme to document
  const applyTheme = useCallback((themeValue: 'light' | 'dark') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeValue);
    root.setAttribute('data-theme', themeValue);
  }, []);

  // Set theme with persistence
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);

      // Persist to cookie and localStorage
      try {
        localStorage.setItem(storageKey, newTheme);
        document.cookie = `${storageKey}=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (error) {
        console.error('Failed to persist theme:', error);
      }
    },
    [storageKey, resolveTheme, applyTheme]
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  // Initialize theme from storage
  useEffect(() => {
    try {
      // Try localStorage first
      const stored = localStorage.getItem(storageKey) as Theme | null;
      
      // Fallback to cookie
      if (!stored) {
        const cookies = document.cookie.split(';');
        const themeCookie = cookies.find((c) => c.trim().startsWith(`${storageKey}=`));
        if (themeCookie) {
          const cookieValue = themeCookie.split('=')[1] as Theme;
          setTheme(cookieValue);
          return;
        }
      }

      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setTheme(stored);
      } else {
        // Use default
        setTheme(defaultTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      setTheme(defaultTheme);
    }
  }, [storageKey, defaultTheme, setTheme]);

  // Listen to system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolvedTheme);
      applyTheme(newResolvedTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

