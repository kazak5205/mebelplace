import 'package:flutter/material.dart';

class AppColors {
  // Orange theme colors (matching React Native app)
  static const Color primary = Color(0xFFf97316);
  static const Color primaryContainer = Color(0xFFfed7aa);
  static const Color secondary = Color(0xFFea580c);
  static const Color secondaryContainer = Color(0xFFfed7aa);
  static const Color tertiary = Color(0xFFfb923c);
  static const Color tertiaryContainer = Color(0xFFfed7aa);
  
  // Surface colors
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFf8fafc);
  static const Color background = Color(0xFFFFFFFF);
  static const Color error = Color(0xFFef4444);
  static const Color errorContainer = Color(0xFFfecaca);
  
  // Text colors
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color onTertiary = Color(0xFFFFFFFF);
  static const Color onSurface = Color(0xFF0f0f0f);
  static const Color onBackground = Color(0xFF0f0f0f);
  static const Color onError = Color(0xFFFFFFFF);
  
  // Outline colors
  static const Color outline = Color(0xFFe2e8f0);
  static const Color outlineVariant = Color(0xFFf1f5f9);
  
  // Dark theme colors
  static const Color darkSurface = Color(0xFF1a1a1a);
  static const Color darkSurfaceVariant = Color(0xFF2a2a2a);
  static const Color darkBackground = Color(0xFF0f0f0f);
  static const Color darkOutline = Color(0xFF404040);
  static const Color darkOutlineVariant = Color(0xFF2a2a2a);
  
  // Additional colors
  static const Color success = Color(0xFF22c55e);
  static const Color warning = Color(0xFFf59e0b);
  static const Color info = Color(0xFF3b82f6);
  static const Color light = Color(0xFFf8fafc);
  static const Color dark = Color(0xFF0f0f0f);
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color gray = Color(0xFF6b7280);
  static const Color lightGray = Color(0xFFe5e7eb);
  static const Color darkGray = Color(0xFF374151);
  
  // Glass effects
  static const Color glassLight = Color(0x1AFFFFFF);
  static const Color glassDark = Color(0x1A000000);
  static const Color glassOrange = Color(0x1Af97316);
  
  // Orange palette
  static const Map<int, Color> orange = {
    50: Color(0xFFfff7ed),
    100: Color(0xFFffedd5),
    200: Color(0xFFfed7aa),
    300: Color(0xFFfdba74),
    400: Color(0xFFfb923c),
    500: Color(0xFFf97316),
    600: Color(0xFFea580c),
    700: Color(0xFFc2410c),
    800: Color(0xFF9a3412),
    900: Color(0xFF7c2d12),
  };
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        primaryContainer: AppColors.primaryContainer,
        secondary: AppColors.secondary,
        secondaryContainer: AppColors.secondaryContainer,
        tertiary: AppColors.tertiary,
        tertiaryContainer: AppColors.tertiaryContainer,
        surface: AppColors.background,
        surfaceContainerHighest: AppColors.surfaceVariant,
        error: AppColors.error,
        errorContainer: AppColors.errorContainer,
        onPrimary: AppColors.onPrimary,
        onSecondary: AppColors.onSecondary,
        onTertiary: AppColors.onTertiary,
        onSurface: AppColors.onBackground,
        onError: AppColors.onError,
        outline: AppColors.outline,
        outlineVariant: AppColors.outlineVariant,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.onSurface,
        elevation: 0,
        centerTitle: true,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.dark,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.gray,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
  
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        primaryContainer: AppColors.primaryContainer,
        secondary: AppColors.secondary,
        secondaryContainer: AppColors.secondaryContainer,
        tertiary: AppColors.tertiary,
        tertiaryContainer: AppColors.tertiaryContainer,
        surface: AppColors.darkBackground,
        surfaceContainerHighest: AppColors.darkSurfaceVariant,
        error: AppColors.error,
        errorContainer: AppColors.errorContainer,
        onPrimary: AppColors.onPrimary,
        onSecondary: AppColors.onSecondary,
        onTertiary: AppColors.onTertiary,
        onSurface: AppColors.white,
        onError: AppColors.onError,
        outline: AppColors.darkOutline,
        outlineVariant: AppColors.darkOutlineVariant,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkSurface,
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.dark,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.gray,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
