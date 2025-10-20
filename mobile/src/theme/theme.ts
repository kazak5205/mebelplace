import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Оранжевая тема (светлая)
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#f97316',
    primaryContainer: '#fed7aa',
    secondary: '#ea580c',
    secondaryContainer: '#fed7aa',
    tertiary: '#fb923c',
    tertiaryContainer: '#fed7aa',
    surface: '#ffffff',
    surfaceVariant: '#f8fafc',
    background: '#ffffff',
    error: '#ef4444',
    errorContainer: '#fecaca',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onTertiary: '#ffffff',
    onSurface: '#0f0f0f',
    onBackground: '#0f0f0f',
    onError: '#ffffff',
    outline: '#e2e8f0',
    outlineVariant: '#f1f5f9',
  },
  roundness: 12,
};

// Оранжевая тема (тёмная)
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#f97316',
    primaryContainer: '#9a3412',
    secondary: '#ea580c',
    secondaryContainer: '#9a3412',
    tertiary: '#fb923c',
    tertiaryContainer: '#9a3412',
    surface: '#1a1a1a',
    surfaceVariant: '#2a2a2a',
    background: '#0f0f0f',
    error: '#ef4444',
    errorContainer: '#7f1d1d',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onTertiary: '#ffffff',
    onSurface: '#ffffff',
    onBackground: '#ffffff',
    onError: '#ffffff',
    outline: '#404040',
    outlineVariant: '#2a2a2a',
  },
  roundness: 12,
};

export const theme = lightTheme; // По умолчанию светлая тема

export const colors = {
  // Оранжевая палитра
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  primary: '#f97316',
  secondary: '#ea580c',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  light: '#f8fafc',
  dark: '#0f0f0f',
  white: '#ffffff',
  black: '#000000',
  gray: '#6b7280',
  lightGray: '#e5e7eb',
  darkGray: '#374151',
  // Стеклянные эффекты
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.1)',
    orange: 'rgba(249, 115, 22, 0.1)',
  }
};
