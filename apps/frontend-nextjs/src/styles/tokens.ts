/**
 * Design System Tokens
 * Auto-generated from design-system/tokens.json
 * DO NOT EDIT MANUALLY - update tokens.json instead
 */

import tokensJson from './tokens.json'

export const tokens = {
  colors: {
    primary: tokensJson.colors.primary,
    primaryDark: tokensJson.colors.primaryDark,
    primaryLight: tokensJson.colors.primaryLight,
    secondary: tokensJson.colors.secondary,
    
    background: {
      light: tokensJson.colors.background.light,
      dark: tokensJson.colors.background.dark,
      lightSurface: tokensJson.colors.background.lightSurface,
      darkSurface: tokensJson.colors.background.darkSurface,
    },
    
    surface: {
      light: tokensJson.colors.surface.light,
      dark: tokensJson.colors.surface.dark,
      lightElevated: tokensJson.colors.surface.lightElevated,
      darkElevated: tokensJson.colors.surface.darkElevated,
    },
    
    glass: {
      blur: tokensJson.colors.glass.blur,
      opacity: tokensJson.colors.glass.opacity,
      border: tokensJson.colors.glass.border,
      borderDark: tokensJson.colors.glass.borderDark,
      shadow: tokensJson.colors.glass.shadow,
    },
    
    text: {
      primary: {
        light: tokensJson.colors.text.primary.light,
        dark: tokensJson.colors.text.primary.dark,
      },
      secondary: {
        light: tokensJson.colors.text.secondary.light,
        dark: tokensJson.colors.text.secondary.dark,
      },
      tertiary: {
        light: tokensJson.colors.text.tertiary.light,
        dark: tokensJson.colors.text.tertiary.dark,
      },
    },
    
    status: {
      success: tokensJson.colors.status.success,
      error: tokensJson.colors.status.error,
      warning: tokensJson.colors.status.warning,
      info: tokensJson.colors.status.info,
    },
    
    social: {
      like: tokensJson.colors.social.like,
      comment: tokensJson.colors.social.comment,
      share: tokensJson.colors.social.share,
      save: tokensJson.colors.social.save,
    },
  },
  
  typography: {
    fontFamily: {
      primary: tokensJson.typography.fontFamily.primary,
      mono: tokensJson.typography.fontFamily.mono,
    },
    
    fontSize: {
      xs: tokensJson.typography.fontSize.xs,
      sm: tokensJson.typography.fontSize.sm,
      base: tokensJson.typography.fontSize.base,
      lg: tokensJson.typography.fontSize.lg,
      xl: tokensJson.typography.fontSize.xl,
      '2xl': tokensJson.typography.fontSize['2xl'],
      '3xl': tokensJson.typography.fontSize['3xl'],
      '4xl': tokensJson.typography.fontSize['4xl'],
    },
    
    lineHeight: {
      tight: tokensJson.typography.lineHeight.tight,
      normal: tokensJson.typography.lineHeight.normal,
      relaxed: tokensJson.typography.lineHeight.relaxed,
    },
    
    fontWeight: {
      regular: tokensJson.typography.fontWeight.regular,
      medium: tokensJson.typography.fontWeight.medium,
      semibold: tokensJson.typography.fontWeight.semibold,
      bold: tokensJson.typography.fontWeight.bold,
      extrabold: tokensJson.typography.fontWeight.extrabold,
    },
    
    letterSpacing: {
      tight: tokensJson.typography.letterSpacing.tight,
      normal: tokensJson.typography.letterSpacing.normal,
      wide: tokensJson.typography.letterSpacing.wide,
    },
  },
  
  spacing: tokensJson.spacing,
  borderRadius: tokensJson.borderRadius,
  
  animation: {
    duration: {
      instant: tokensJson.animation.duration.instant,
      fast: tokensJson.animation.duration.fast,
      default: tokensJson.animation.duration.default,
      slow: tokensJson.animation.duration.slow,
      slower: tokensJson.animation.duration.slower,
    },
    
    easing: {
      default: tokensJson.animation.easing.default,
      in: tokensJson.animation.easing.in,
      out: tokensJson.animation.easing.out,
      inOut: tokensJson.animation.easing.inOut,
      spring: tokensJson.animation.easing.spring,
    },
  },
  
  shadows: tokensJson.shadows,
  blur: tokensJson.blur,
  breakpoints: tokensJson.breakpoints,
  zIndex: tokensJson.zIndex,
  iconSizes: tokensJson.iconSizes,
  touchTarget: tokensJson.touchTarget,
  
  microinteractions: {
    doubleTapLike: tokensJson.microinteractions.doubleTapLike,
    bottomSheet: tokensJson.microinteractions.bottomSheet,
    skeletonPulse: tokensJson.microinteractions.skeletonPulse,
    buttonPress: tokensJson.microinteractions.buttonPress,
    pageTransition: tokensJson.microinteractions.pageTransition,
  },
} as const

// Type helpers
export type ColorTheme = 'light' | 'dark'
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type SpacingKey = keyof typeof tokens.spacing
export type BorderRadiusKey = keyof typeof tokens.borderRadius

