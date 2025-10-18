/**
 * Design System - Spacing Tokens
 * Based on 8pt grid system
 */

export const spacing = {
  0: '0',
  xs: '4px',    // 0.5 units
  sm: '8px',    // 1 unit
  md: '16px',   // 2 units
  lg: '24px',   // 3 units
  xl: '32px',   // 4 units
  '2xl': '40px', // 5 units
  '3xl': '48px', // 6 units
  '4xl': '64px', // 8 units
  '5xl': '80px', // 10 units
  '6xl': '96px', // 12 units
} as const;

export const gap = spacing;

export const padding = spacing;

export const margin = spacing;

export type SpacingToken = typeof spacing;

