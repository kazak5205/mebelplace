/**
 * Design System - Border Radius Tokens
 */

export const radii = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

export type RadiiToken = typeof radii;

