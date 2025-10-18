/**
 * Design System - Typography Tokens
 * Font sizes, line heights, and font weights
 */

export const fontSizes = {
  xs: '12px',
  sm: '14px',
  base: '15px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '22px',
  '3xl': '24px',
  '4xl': '28px',
  '5xl': '32px',
  '6xl': '36px',
  '7xl': '48px',
} as const;

export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

/**
 * Typography presets for common text styles
 */
export const typography = {
  h1: {
    fontSize: fontSizes['6xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSizes['5xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights.snug,
    fontWeight: fontWeights.semibold,
  },
  h4: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights.snug,
    fontWeight: fontWeights.semibold,
  },
  h5: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.medium,
  },
  h6: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.medium,
  },
  body: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.normal,
  },
  bodyLarge: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.relaxed,
    fontWeight: fontWeights.normal,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.normal,
  },
  caption: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.normal,
  },
  button: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.none,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.wide,
  },
} as const;

export type TypographyToken = typeof typography;
export type FontSize = typeof fontSizes;
export type LineHeight = typeof lineHeights;
export type FontWeight = typeof fontWeights;

