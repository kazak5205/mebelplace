#!/usr/bin/env node

/**
 * Скрипт для синхронизации design tokens между платформами
 * Генерирует TypeScript и Dart файлы из единого JSON
 */

const fs = require('fs');
const path = require('path');

// Пути к файлам
const TOKENS_JSON = path.join(__dirname, '../design-system/tokens-unified.json');
const WEB_TOKENS_TS = path.join(__dirname, '../apps/frontend-nextjs/src/styles/tokens.ts');
const MOBILE_TOKENS_DART = path.join(__dirname, '../apps/mobile/lib/core/theme/design_tokens.dart');

// Загружаем токены
const tokens = JSON.parse(fs.readFileSync(TOKENS_JSON, 'utf8'));

// Генерируем TypeScript файл
function generateTypeScriptTokens() {
  const tsContent = `/**
 * Design System Tokens
 * Auto-generated from design-system/tokens-unified.json
 * DO NOT EDIT MANUALLY - run 'npm run sync-tokens' instead
 * Generated: ${new Date().toISOString()}
 */

export const tokens = {
  colors: {
    primary: '${tokens.colors.primary.value}',
    primaryDark: '${tokens.colors.primaryDark.value}',
    primaryLight: '${tokens.colors.primaryLight.value}',
    secondary: '${tokens.colors.secondary.value}',
    
    background: {
      light: '${tokens.colors.background.light.value}',
      dark: '${tokens.colors.background.dark.value}',
      lightSurface: '${tokens.colors.background.lightSurface.value}',
      darkSurface: '${tokens.colors.background.darkSurface.value}',
    },
    
    surface: {
      light: '${tokens.colors.surface.light.value}',
      dark: '${tokens.colors.surface.dark.value}',
      lightElevated: '${tokens.colors.surface.lightElevated.value}',
      darkElevated: '${tokens.colors.surface.darkElevated.value}',
    },
    
    glass: {
      blur: '${tokens.colors.glass.blur.value}',
      opacity: ${tokens.colors.glass.opacity.value},
      border: '${tokens.colors.glass.border.value}',
      borderDark: '${tokens.colors.glass.borderDark.value}',
      shadow: '${tokens.colors.glass.shadow.value}',
    },
    
    text: {
      primary: {
        light: '${tokens.colors.text.primary.light.value}',
        dark: '${tokens.colors.text.primary.dark.value}',
      },
      secondary: {
        light: '${tokens.colors.text.secondary.light.value}',
        dark: '${tokens.colors.text.secondary.dark.value}',
      },
      tertiary: {
        light: '${tokens.colors.text.tertiary.light.value}',
        dark: '${tokens.colors.text.tertiary.dark.value}',
      },
    },
    
    status: {
      success: '${tokens.colors.status.success.value}',
      error: '${tokens.colors.status.error.value}',
      warning: '${tokens.colors.status.warning.value}',
      info: '${tokens.colors.status.info.value}',
    },
    
    social: {
      like: '${tokens.colors.social.like.value}',
      comment: '${tokens.colors.social.comment.value}',
      share: '${tokens.colors.social.share.value}',
      save: '${tokens.colors.social.save.value}',
    },
  },
  
  typography: {
    fontFamily: {
      primary: '${tokens.typography.fontFamily.primary.value}',
      mono: '${tokens.typography.fontFamily.mono.value}',
    },
    
    fontSize: {
      xs: '${tokens.typography.fontSize.xs.value}',
      sm: '${tokens.typography.fontSize.sm.value}',
      base: '${tokens.typography.fontSize.base.value}',
      lg: '${tokens.typography.fontSize.lg.value}',
      xl: '${tokens.typography.fontSize.xl.value}',
      '2xl': '${tokens.typography.fontSize['2xl'].value}',
      '3xl': '${tokens.typography.fontSize['3xl'].value}',
      '4xl': '${tokens.typography.fontSize['4xl'].value}',
    },
    
    lineHeight: {
      tight: ${tokens.typography.lineHeight.tight.value},
      normal: ${tokens.typography.lineHeight.normal.value},
      relaxed: ${tokens.typography.lineHeight.relaxed.value},
    },
    
    fontWeight: {
      regular: ${tokens.typography.fontWeight.regular.value},
      medium: ${tokens.typography.fontWeight.medium.value},
      semibold: ${tokens.typography.fontWeight.semibold.value},
      bold: ${tokens.typography.fontWeight.bold.value},
      extrabold: ${tokens.typography.fontWeight.extrabold.value},
    },
    
    letterSpacing: {
      tight: '${tokens.typography.letterSpacing.tight.value}',
      normal: '${tokens.typography.letterSpacing.normal.value}',
      wide: '${tokens.typography.letterSpacing.wide.value}',
    },
  },
  
  spacing: {
    unit: '${tokens.spacing.unit.value}',
    0: '${tokens.spacing['0'].value}',
    1: '${tokens.spacing['1'].value}',
    2: '${tokens.spacing['2'].value}',
    3: '${tokens.spacing['3'].value}',
    4: '${tokens.spacing['4'].value}',
    5: '${tokens.spacing['5'].value}',
    6: '${tokens.spacing['6'].value}',
    8: '${tokens.spacing['8'].value}',
    10: '${tokens.spacing['10'].value}',
    12: '${tokens.spacing['12'].value}',
    16: '${tokens.spacing['16'].value}',
    20: '${tokens.spacing['20'].value}',
    24: '${tokens.spacing['24'].value}',
  },
  
  borderRadius: {
    none: '${tokens.borderRadius.none.value}',
    sm: '${tokens.borderRadius.sm.value}',
    md: '${tokens.borderRadius.md.value}',
    lg: '${tokens.borderRadius.lg.value}',
    xl: '${tokens.borderRadius.xl.value}',
    '2xl': '${tokens.borderRadius['2xl'].value}',
    full: '${tokens.borderRadius.full.value}',
  },
  
  animation: {
    duration: {
      instant: '${tokens.animation.duration.instant.value}',
      fast: '${tokens.animation.duration.fast.value}',
      default: '${tokens.animation.duration.default.value}',
      slow: '${tokens.animation.duration.slow.value}',
      slower: '${tokens.animation.duration.slower.value}',
    },
    
    easing: {
      default: '${tokens.animation.easing.default.value}',
      in: '${tokens.animation.easing.in.value}',
      out: '${tokens.animation.easing.out.value}',
      inOut: '${tokens.animation.easing.inOut.value}',
      spring: '${tokens.animation.easing.spring.value}',
    },
  },
  
  shadows: {
    none: '${tokens.shadows.none.value}',
    xs: '${tokens.shadows.xs.value}',
    sm: '${tokens.shadows.sm.value}',
    md: '${tokens.shadows.md.value}',
    lg: '${tokens.shadows.lg.value}',
    xl: '${tokens.shadows.xl.value}',
    '2xl': '${tokens.shadows['2xl'].value}',
    glass: '${tokens.shadows.glass.value}',
    inner: '${tokens.shadows.inner.value}',
  },
  
  blur: {
    none: '${tokens.blur.none.value}',
    sm: '${tokens.blur.sm.value}',
    md: '${tokens.blur.md.value}',
    lg: '${tokens.blur.lg.value}',
    xl: '${tokens.blur.xl.value}',
    '2xl': '${tokens.blur['2xl'].value}',
  },
  
  breakpoints: {
    xs: '${tokens.breakpoints.xs.value}',
    sm: '${tokens.breakpoints.sm.value}',
    md: '${tokens.breakpoints.md.value}',
    lg: '${tokens.breakpoints.lg.value}',
    xl: '${tokens.breakpoints.xl.value}',
    '2xl': '${tokens.breakpoints['2xl'].value}',
  },
  
  zIndex: {
    hide: ${tokens.zIndex.hide.value},
    base: ${tokens.zIndex.base.value},
    dropdown: ${tokens.zIndex.dropdown.value},
    sticky: ${tokens.zIndex.sticky.value},
    overlay: ${tokens.zIndex.overlay.value},
    modal: ${tokens.zIndex.modal.value},
    popover: ${tokens.zIndex.popover.value},
    toast: ${tokens.zIndex.toast.value},
    tooltip: ${tokens.zIndex.tooltip.value},
  },
  
  iconSizes: {
    xs: '${tokens.iconSizes.xs.value}',
    sm: '${tokens.iconSizes.sm.value}',
    md: '${tokens.iconSizes.md.value}',
    lg: '${tokens.iconSizes.lg.value}',
    xl: '${tokens.iconSizes.xl.value}',
    '2xl': '${tokens.iconSizes['2xl'].value}',
  },
  
  touchTarget: {
    min: '${tokens.touchTarget.min.value}',
    comfortable: '${tokens.touchTarget.comfortable.value}',
  },
  
  microinteractions: {
    doubleTapLike: {
      duration: ${tokens.microinteractions.doubleTapLike.duration},
      steps: ${JSON.stringify(tokens.microinteractions.doubleTapLike.steps)},
      haptic: '${tokens.microinteractions.doubleTapLike.haptic}',
    },
    bottomSheet: {
      dragThreshold: ${tokens.microinteractions.bottomSheet.dragThreshold},
      openDuration: ${tokens.microinteractions.bottomSheet.openDuration},
      closeDuration: ${tokens.microinteractions.bottomSheet.closeDuration},
      backdropBlur: ${JSON.stringify(tokens.microinteractions.bottomSheet.backdropBlur)},
    },
    skeletonPulse: {
      duration: ${tokens.microinteractions.skeletonPulse.duration},
      keyframes: ${JSON.stringify(tokens.microinteractions.skeletonPulse.keyframes)},
    },
    buttonPress: {
      duration: ${tokens.microinteractions.buttonPress.duration},
      scale: ${tokens.microinteractions.buttonPress.scale},
    },
    pageTransition: {
      duration: ${tokens.microinteractions.pageTransition.duration},
      enter: ${JSON.stringify(tokens.microinteractions.pageTransition.enter)},
      exit: ${JSON.stringify(tokens.microinteractions.pageTransition.exit)},
    },
  },
  
  components: {
    button: {
      variants: ${JSON.stringify(tokens.components.button.variants)},
      sizes: ${JSON.stringify(tokens.components.button.sizes)},
    },
    card: {
      variants: ${JSON.stringify(tokens.components.card.variants)},
    },
    modal: {
      variants: ${JSON.stringify(tokens.components.modal.variants)},
      sizes: ${JSON.stringify(tokens.components.modal.sizes)},
    },
    input: {
      variants: ${JSON.stringify(tokens.components.input.variants)},
      sizes: ${JSON.stringify(tokens.components.input.sizes)},
    },
  },
} as const;

export type Tokens = typeof tokens;
`;

  fs.writeFileSync(WEB_TOKENS_TS, tsContent);
  console.log('✅ Generated TypeScript tokens');
}

// Генерируем Dart файл
function generateDartTokens() {
  const dartContent = `/// Design System Tokens for Flutter
/// Auto-generated from design-system/tokens-unified.json
/// DO NOT EDIT MANUALLY - run 'npm run sync-tokens' instead
/// Generated: ${new Date().toISOString()}

import 'package:flutter/material.dart';

class DesignTokens {
  // Colors
  static const Color primary = Color(0xFFFF6600);
  static const Color primaryDark = Color(0xFFFF4500);
  static const Color primaryLight = Color(0xFFFF8533);
  static const Color secondary = Color(0xFF0A0A0A);

  // Background Colors
  static const Color backgroundLight = Color(0xFFFFFFFF);
  static const Color backgroundDark = Color(0xFF0A0A0A);
  static const Color backgroundLightSurface = Color(0xFFF8F8F8);
  static const Color backgroundDarkSurface = Color(0xFF1A1A1A);

  // Surface Colors
  static const Color surfaceLight = Color(0xB3FFFFFF); // rgba(255, 255, 255, 0.7)
  static const Color surfaceDark = Color(0xB3141414);  // rgba(20, 20, 20, 0.7)
  static const Color surfaceLightElevated = Color(0xE6FFFFFF); // rgba(255, 255, 255, 0.9)
  static const Color surfaceDarkElevated = Color(0xE61E1E1E);  // rgba(30, 30, 30, 0.9)

  // Glass Colors
  static const Color glassBorder = Color(0x33FFFFFF); // rgba(255, 255, 255, 0.2)
  static const Color glassBorderDark = Color(0x1AFFFFFF); // rgba(255, 255, 255, 0.1)
  static const double glassOpacity = 0.7;
  static const double glassBlur = 16.0;

  // Text Colors
  static const Color textPrimaryLight = Color(0xFF0A0A0A);
  static const Color textPrimaryDark = Color(0xFFFFFFFF);
  static const Color textSecondaryLight = Color(0xFF666666);
  static const Color textSecondaryDark = Color(0xFFA0A0A0);
  static const Color textTertiaryLight = Color(0xFF999999);
  static const Color textTertiaryDark = Color(0xFF707070);

  // Status Colors
  static const Color statusSuccess = Color(0xFF00C853);
  static const Color statusError = Color(0xFFFF3D00);
  static const Color statusWarning = Color(0xFFFFB300);
  static const Color statusInfo = Color(0xFF00B8D4);

  // Social Colors
  static const Color socialLike = Color(0xFFFF3D71);
  static const Color socialComment = Color(0xFF00B8D4);
  static const Color socialShare = Color(0xFF00C853);
  static const Color socialSave = Color(0xFFFFB300);

  // Typography
  static const String fontFamilyPrimary = 'Inter';
  static const String fontFamilyMono = 'JetBrains Mono';

  // Font Sizes
  static const double fontSizeXs = 12.0;
  static const double fontSizeSm = 14.0;
  static const double fontSizeBase = 15.0;
  static const double fontSizeLg = 18.0;
  static const double fontSizeXl = 24.0;
  static const double fontSize2xl = 32.0;
  static const double fontSize3xl = 40.0;
  static const double fontSize4xl = 48.0;

  // Line Heights
  static const double lineHeightTight = 1.25;
  static const double lineHeightNormal = 1.47;
  static const double lineHeightRelaxed = 1.75;

  // Font Weights
  static const FontWeight fontWeightRegular = FontWeight.w400;
  static const FontWeight fontWeightMedium = FontWeight.w500;
  static const FontWeight fontWeightSemibold = FontWeight.w600;
  static const FontWeight fontWeightBold = FontWeight.w700;
  static const FontWeight fontWeightExtrabold = FontWeight.w800;

  // Letter Spacing
  static const double letterSpacingTight = -0.02;
  static const double letterSpacingNormal = 0.0;
  static const double letterSpacingWide = 0.02;

  // Spacing (в логических пикселях)
  static const double spacing0 = 0.0;
  static const double spacing1 = 4.0;
  static const double spacing2 = 8.0;
  static const double spacing3 = 12.0;
  static const double spacing4 = 16.0;
  static const double spacing5 = 20.0;
  static const double spacing6 = 24.0;
  static const double spacing8 = 32.0;
  static const double spacing10 = 40.0;
  static const double spacing12 = 48.0;
  static const double spacing16 = 64.0;
  static const double spacing20 = 80.0;
  static const double spacing24 = 96.0;

  // Border Radius
  static const double borderRadiusNone = 0.0;
  static const double borderRadiusSm = 8.0;
  static const double borderRadiusMd = 12.0;
  static const double borderRadiusLg = 16.0;
  static const double borderRadiusXl = 24.0;
  static const double borderRadius2xl = 32.0;
  static const double borderRadiusFull = 9999.0;

  // Animation Durations
  static const Duration durationInstant = Duration.zero;
  static const Duration durationFast = Duration(milliseconds: 120);
  static const Duration durationDefault = Duration(milliseconds: 240);
  static const Duration durationSlow = Duration(milliseconds: 360);
  static const Duration durationSlower = Duration(milliseconds: 500);

  // Animation Curves
  static const Curve easingDefault = Curves.easeInOut;
  static const Curve easingIn = Curves.easeIn;
  static const Curve easingOut = Curves.easeOut;
  static const Curve easingInOut = Curves.easeInOut;
  static const Curve easingSpring = Curves.elasticOut;

  // Shadows
  static const List<BoxShadow> shadowNone = [];
  static const List<BoxShadow> shadowXs = [
    BoxShadow(
      color: Color(0x0D000000), // rgba(0, 0, 0, 0.05)
      offset: Offset(0, 1),
      blurRadius: 2,
    ),
  ];
  static const List<BoxShadow> shadowSm = [
    BoxShadow(
      color: Color(0x14000000), // rgba(0, 0, 0, 0.08)
      offset: Offset(0, 2),
      blurRadius: 8,
    ),
  ];
  static const List<BoxShadow> shadowMd = [
    BoxShadow(
      color: Color(0x1F000000), // rgba(0, 0, 0, 0.12)
      offset: Offset(0, 4),
      blurRadius: 16,
    ),
  ];
  static const List<BoxShadow> shadowLg = [
    BoxShadow(
      color: Color(0x29000000), // rgba(0, 0, 0, 0.16)
      offset: Offset(0, 8),
      blurRadius: 32,
    ),
  ];
  static const List<BoxShadow> shadowXl = [
    BoxShadow(
      color: Color(0x33000000), // rgba(0, 0, 0, 0.20)
      offset: Offset(0, 12),
      blurRadius: 48,
    ),
  ];
  static const List<BoxShadow> shadow2xl = [
    BoxShadow(
      color: Color(0x3D000000), // rgba(0, 0, 0, 0.24)
      offset: Offset(0, 24),
      blurRadius: 64,
    ),
  ];
  static const List<BoxShadow> shadowGlass = [
    BoxShadow(
      color: Color(0x14000000), // rgba(0, 0, 0, 0.08)
      offset: Offset(0, 8),
      blurRadius: 32,
    ),
  ];

  // Blur
  static const double blurNone = 0.0;
  static const double blurSm = 4.0;
  static const double blurMd = 8.0;
  static const double blurLg = 16.0;
  static const double blurXl = 24.0;
  static const double blur2xl = 40.0;

  // Breakpoints
  static const double breakpointXs = 320.0;
  static const double breakpointSm = 640.0;
  static const double breakpointMd = 768.0;
  static const double breakpointLg = 1024.0;
  static const double breakpointXl = 1280.0;
  static const double breakpoint2xl = 1536.0;

  // Z-Index
  static const int zIndexHide = -1;
  static const int zIndexBase = 0;
  static const int zIndexDropdown = 1000;
  static const int zIndexSticky = 1100;
  static const int zIndexOverlay = 1200;
  static const int zIndexModal = 1300;
  static const int zIndexPopover = 1400;
  static const int zIndexToast = 1500;
  static const int zIndexTooltip = 1600;

  // Icon Sizes
  static const double iconSizeXs = 16.0;
  static const double iconSizeSm = 20.0;
  static const double iconSizeMd = 24.0;
  static const double iconSizeLg = 32.0;
  static const double iconSizeXl = 48.0;
  static const double iconSize2xl = 64.0;

  // Touch Targets
  static const double touchTargetMin = 44.0;
  static const double touchTargetComfortable = 48.0;

  // Microinteractions
  static const Duration doubleTapLikeDuration = Duration(milliseconds: 350);
  static const Duration bottomSheetOpenDuration = Duration(milliseconds: 240);
  static const Duration bottomSheetCloseDuration = Duration(milliseconds: 200);
  static const Duration skeletonPulseDuration = Duration(milliseconds: 1500);
  static const Duration buttonPressDuration = Duration(milliseconds: 60);
  static const Duration pageTransitionDuration = Duration(milliseconds: 200);

  // Button Press Scale
  static const double buttonPressScale = 0.98;

  // Bottom Sheet
  static const double bottomSheetDragThreshold = 50.0;
  static const double bottomSheetBackdropBlurFrom = 0.0;
  static const double bottomSheetBackdropBlurTo = 8.0;
}

/// Helper класс для работы с токенами
class DesignTokensHelper {
  /// Получить цвет для темы
  static Color getTextColor(bool isDark, {bool isSecondary = false, bool isTertiary = false}) {
    if (isTertiary) {
      return isDark ? DesignTokens.textTertiaryDark : DesignTokens.textTertiaryLight;
    }
    if (isSecondary) {
      return isDark ? DesignTokens.textSecondaryDark : DesignTokens.textSecondaryLight;
    }
    return isDark ? DesignTokens.textPrimaryDark : DesignTokens.textPrimaryLight;
  }

  /// Получить цвет фона для темы
  static Color getBackgroundColor(bool isDark, {bool isSurface = false, bool isElevated = false}) {
    if (isElevated) {
      return isDark ? DesignTokens.surfaceDarkElevated : DesignTokens.surfaceLightElevated;
    }
    if (isSurface) {
      return isDark ? DesignTokens.surfaceDark : DesignTokens.surfaceLight;
    }
    return isDark ? DesignTokens.backgroundDark : DesignTokens.backgroundLight;
  }

  /// Получить тень для glass эффекта
  static List<BoxShadow> getGlassShadow() {
    return DesignTokens.shadowGlass;
  }

  /// Получить blur для glass эффекта
  static double getGlassBlur() {
    return DesignTokens.glassBlur;
  }

  /// Получить border radius для glass эффекта
  static double getGlassBorderRadius() {
    return DesignTokens.borderRadiusLg;
  }

  /// Получить цвет border для glass эффекта
  static Color getGlassBorderColor(bool isDark) {
    return isDark ? DesignTokens.glassBorderDark : DesignTokens.glassBorder;
  }

  /// Получить spacing по индексу
  static double getSpacing(int index) {
    switch (index) {
      case 0: return DesignTokens.spacing0;
      case 1: return DesignTokens.spacing1;
      case 2: return DesignTokens.spacing2;
      case 3: return DesignTokens.spacing3;
      case 4: return DesignTokens.spacing4;
      case 5: return DesignTokens.spacing5;
      case 6: return DesignTokens.spacing6;
      case 8: return DesignTokens.spacing8;
      case 10: return DesignTokens.spacing10;
      case 12: return DesignTokens.spacing12;
      case 16: return DesignTokens.spacing16;
      case 20: return DesignTokens.spacing20;
      case 24: return DesignTokens.spacing24;
      default: return DesignTokens.spacing4;
    }
  }

  /// Получить размер шрифта
  static double getFontSize(String size) {
    switch (size) {
      case 'xs': return DesignTokens.fontSizeXs;
      case 'sm': return DesignTokens.fontSizeSm;
      case 'base': return DesignTokens.fontSizeBase;
      case 'lg': return DesignTokens.fontSizeLg;
      case 'xl': return DesignTokens.fontSizeXl;
      case '2xl': return DesignTokens.fontSize2xl;
      case '3xl': return DesignTokens.fontSize3xl;
      case '4xl': return DesignTokens.fontSize4xl;
      default: return DesignTokens.fontSizeBase;
    }
  }

  /// Получить вес шрифта
  static FontWeight getFontWeight(String weight) {
    switch (weight) {
      case 'regular': return DesignTokens.fontWeightRegular;
      case 'medium': return DesignTokens.fontWeightMedium;
      case 'semibold': return DesignTokens.fontWeightSemibold;
      case 'bold': return DesignTokens.fontWeightBold;
      case 'extrabold': return DesignTokens.fontWeightExtrabold;
      default: return DesignTokens.fontWeightRegular;
    }
  }
}
`;

  fs.writeFileSync(MOBILE_TOKENS_DART, dartContent);
  console.log('✅ Generated Dart tokens');
}

// Основная функция
function main() {
  console.log('🔄 Syncing design tokens...');
  
  try {
    generateTypeScriptTokens();
    generateDartTokens();
    
    console.log('✅ Design tokens synced successfully!');
    console.log('📁 Files updated:');
    console.log(`   - ${WEB_TOKENS_TS}`);
    console.log(`   - ${MOBILE_TOKENS_DART}`);
    
  } catch (error) {
    console.error('❌ Error syncing tokens:', error.message);
    process.exit(1);
  }
}

// Запускаем скрипт
if (require.main === module) {
  main();
}

module.exports = { generateTypeScriptTokens, generateDartTokens };
