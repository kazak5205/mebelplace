/**
 * Design System - Color Tokens
 * MebelPlace brand colors with light/dark theme support
 */

export const colors = {
  // Background colors
  bg: {
    light: '#FFFFFF',
    dark: '#0E0E0E',
  },
  surface: {
    light: '#F5F5F5',
    dark: '#1A1A1A',
  },
  surfaceElevated: {
    light: '#FFFFFF',
    dark: '#242424',
  },
  
  // Text colors
  textPrimary: {
    light: '#111111',
    dark: '#FFFFFF',
  },
  textSecondary: {
    light: '#5A5A5A',
    dark: '#B3B3B3',
  },
  textTertiary: {
    light: '#8A8A8A',
    dark: '#6A6A6A',
  },
  
  // Brand & Accent colors
  accent: '#FF7A00',
  accentDark: '#FF4500',
  accentLight: '#FFA040',
  accentHover: {
    light: '#E55A00',
    dark: '#FF8520',
  },
  
  // Status colors
  success: '#4CAF50',
  successLight: '#81C784',
  successDark: '#388E3C',
  
  error: '#E63946',
  errorLight: '#EF5350',
  errorDark: '#C62828',
  
  warning: '#FFA726',
  warningLight: '#FFB74D',
  warningDark: '#F57C00',
  
  info: '#29B6F6',
  infoLight: '#4FC3F7',
  infoDark: '#0288D1',
  
  // Neutral colors
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Border colors
  border: {
    light: '#E0E0E0',
    dark: '#333333',
  },
  borderSubtle: {
    light: '#F5F5F5',
    dark: '#1F1F1F',
  },
  
  // Overlay colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
  backdropBlur: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(14, 14, 14, 0.8)',
  },
  
  // Special colors
  skeleton: {
    light: '#E0E0E0',
    dark: '#2A2A2A',
  },
  skeletonShimmer: {
    light: '#F5F5F5',
    dark: '#3A3A3A',
  },
} as const;

export type ColorToken = typeof colors;
export type ThemeMode = 'light' | 'dark';

