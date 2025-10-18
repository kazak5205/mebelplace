import 'package:flutter/material.dart';
import 'liquid_glass_colors.dart';

/// Liquid Glass text styles for MebelPlace app
/// These styles provide consistent typography with glass-like effects
class LiquidGlassTextStyles {
  LiquidGlassTextStyles._();

  // ========== FONT SIZES ==========
  static const double fontSizeXS = 12.0;
  static const double fontSizeSM = 14.0;
  static const double fontSizeBase = 16.0;
  static const double fontSizeLG = 18.0;
  static const double fontSizeXL = 20.0;
  static const double fontSize2XL = 24.0;
  static const double fontSize3XL = 30.0;
  static const double fontSize4XL = 36.0;

  // ========== FONT WEIGHTS ==========
  static const FontWeight fontWeightLight = FontWeight.w300;
  static const FontWeight fontWeightNormal = FontWeight.w400;
  static const FontWeight fontWeightMedium = FontWeight.w500;
  static const FontWeight fontWeightSemibold = FontWeight.w600;
  static const FontWeight fontWeightBold = FontWeight.w700;
  static const FontWeight fontWeightExtrabold = FontWeight.w800;

  // ========== LINE HEIGHTS ==========
  static const double lineHeightTight = 1.2;
  static const double lineHeightNormal = 1.4;
  static const double lineHeightRelaxed = 1.6;
  static const double lineHeightLoose = 1.8;

  // ========== HEADING STYLES ==========
  static const TextStyle heading1 = TextStyle(
    fontSize: fontSize4XL,
    fontWeight: fontWeightBold,
    height: lineHeightTight,
    color: LiquidGlassColors.textPrimary,
  );

  static const TextStyle heading2 = TextStyle(
    fontSize: fontSize3XL,
    fontWeight: fontWeightBold,
    height: lineHeightTight,
    color: LiquidGlassColors.textPrimary,
  );

  static const TextStyle heading3 = TextStyle(
    fontSize: fontSize2XL,
    fontWeight: fontWeightSemibold,
    height: lineHeightNormal,
    color: LiquidGlassColors.textPrimary,
  );

  static const TextStyle heading4 = TextStyle(
    fontSize: fontSizeXL,
    fontWeight: fontWeightSemibold,
    height: lineHeightNormal,
    color: LiquidGlassColors.textPrimary,
  );

  static const TextStyle heading5 = TextStyle(
    fontSize: fontSizeLG,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.textPrimary,
  );

  static const TextStyle heading6 = TextStyle(
    fontSize: fontSizeBase,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.textPrimary,
  );

  // ========== BODY TEXT STYLES ==========
  static const TextStyle bodyLarge = TextStyle(
    fontSize: fontSizeLG,
    fontWeight: fontWeightNormal,
    height: lineHeightRelaxed,
    color: LiquidGlassColors.textPrimary,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: fontSizeBase,
    fontWeight: fontWeightNormal,
    height: lineHeightNormal,
    color: LiquidGlassColors.textPrimary,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: fontSizeSM,
    fontWeight: fontWeightNormal,
    height: lineHeightNormal,
    color: LiquidGlassColors.textSecondary,
  );

  // ========== CAPTION STYLES ==========
  static const TextStyle caption = TextStyle(
    fontSize: fontSizeXS,
    fontWeight: fontWeightNormal,
    height: lineHeightNormal,
    color: LiquidGlassColors.textLight,
  );

  static const TextStyle overline = TextStyle(
    fontSize: fontSizeXS,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.textSecondary,
    letterSpacing: 0.5,
  );

  // ========== BUTTON TEXT STYLES ==========
  static const TextStyle buttonLarge = TextStyle(
    fontSize: fontSizeLG,
    fontWeight: fontWeightSemibold,
    height: lineHeightNormal,
    color: LiquidGlassColors.surfaceLight,
  );

  static const TextStyle buttonMedium = TextStyle(
    fontSize: fontSizeBase,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.surfaceLight,
  );

  static const TextStyle buttonSmall = TextStyle(
    fontSize: fontSizeSM,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.surfaceLight,
  );

  // ========== LINK STYLES ==========
  static const TextStyle link = TextStyle(
    fontSize: fontSizeBase,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.primary,
    decoration: TextDecoration.underline,
  );

  static const TextStyle linkSmall = TextStyle(
    fontSize: fontSizeSM,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.primary,
    decoration: TextDecoration.underline,
  );

  // ========== GLASS EFFECT STYLES ==========
  static const TextStyle glassHeading = TextStyle(
    fontSize: fontSize2XL,
    fontWeight: fontWeightBold,
    height: lineHeightTight,
    color: LiquidGlassColors.surfaceLight,
    shadows: [
      Shadow(
        offset: Offset(0, 1),
        blurRadius: 2,
        color: LiquidGlassColors.glassBlack,
      ),
    ],
  );

  static const TextStyle glassBody = TextStyle(
    fontSize: fontSizeBase,
    fontWeight: fontWeightNormal,
    height: lineHeightNormal,
    color: LiquidGlassColors.surfaceLight,
    shadows: [
      Shadow(
        offset: Offset(0, 1),
        blurRadius: 1,
        color: LiquidGlassColors.glassBlack,
      ),
    ],
  );

  // ========== STATUS TEXT STYLES ==========
  static const TextStyle success = TextStyle(
    fontSize: fontSizeSM,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.success,
  );

  static const TextStyle warning = TextStyle(
    fontSize: fontSizeSM,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.warning,
  );

  static const TextStyle error = TextStyle(
    fontSize: fontSizeSM,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.error,
  );

  static const TextStyle info = TextStyle(
    fontSize: fontSizeSM,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.info,
  );

  // ========== SHORT ALIASES ==========
  static const TextStyle h1 = heading1;
  static const TextStyle h2 = heading2;
  static const TextStyle h3 = heading3;
  static const TextStyle h4 = heading4;
  static const TextStyle h5 = heading5;
  static const TextStyle h6 = heading6;
  static const TextStyle body = bodyMedium;

  // ========== DYNAMIC STYLES ==========
  static TextStyle h3Light(bool isDark) {
    return h3.copyWith(
      color: isDark ? LiquidGlassColors.textOnDark : LiquidGlassColors.textPrimary,
    );
  }

  static TextStyle bodySecondary(bool isDark) {
    return bodyMedium.copyWith(
      color: isDark ? LiquidGlassColors.textLight : LiquidGlassColors.textSecondary,
    );
  }

  // ========== HELPER METHODS ==========
  
  /// Get text style with custom color
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }

  /// Get text style with custom size
  static TextStyle withSize(TextStyle style, double size) {
    return style.copyWith(fontSize: size);
  }

  /// Get text style with custom weight
  static TextStyle withWeight(TextStyle style, FontWeight weight) {
    return style.copyWith(fontWeight: weight);
  }

  /// Get dark mode text style
  static TextStyle forDarkMode(TextStyle style) {
    return style.copyWith(color: LiquidGlassColors.textOnDark);
  }

  /// Get glass effect text style
  static TextStyle withGlassEffect(TextStyle style, {bool isDark = false}) {
    return style.copyWith(
      color: isDark ? LiquidGlassColors.textOnDark : LiquidGlassColors.surfaceLight,
      shadows: [
        Shadow(
          offset: const Offset(0, 1),
          blurRadius: 2,
          color: isDark ? LiquidGlassColors.glassWhite : LiquidGlassColors.glassBlack,
        ),
      ],
    );
  }
  
  // ========== ADDITIONAL STYLES FOR COMPATIBILITY ==========
  static TextStyle h1Light(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return h1.copyWith(
      color: isDark ? LiquidGlassColors.surfaceLight : LiquidGlassColors.surfaceDark,
    );
  }
  
  static TextStyle h2Light(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return h2.copyWith(
      color: isDark ? LiquidGlassColors.surfaceLight : LiquidGlassColors.surfaceDark,
    );
  }
  
  // Video specific styles
  static const TextStyle videoTitle = TextStyle(
    fontSize: fontSizeLG,
    fontWeight: fontWeightBold,
    height: lineHeightTight,
    color: LiquidGlassColors.surfaceLight,
  );
  
  static const TextStyle videoDescription = TextStyle(
    fontSize: fontSizeBase,
    fontWeight: fontWeightNormal,
    height: lineHeightNormal,
    color: LiquidGlassColors.surfaceLight,
  );
  
  static const TextStyle videoCaption = TextStyle(
    fontSize: fontSizeSM,
    fontWeight: fontWeightMedium,
    height: lineHeightNormal,
    color: LiquidGlassColors.surfaceLight,
  );
}