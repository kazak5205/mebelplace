import 'package:flutter/material.dart';

/// Цветовая схема приложения MebelPlace
class AppColors {
  AppColors._();

  // Light Theme Colors
  static const Color lightPrimary = Color(0xFFFF7A00);
  static const Color lightPrimaryVariant = Color(0xFFFF6600);
  static const Color lightSecondary = Color(0xFF111111);
  static const Color lightSecondaryVariant = Color(0xFF333333);
  
  static const Color lightBackground = Color(0xFFFFFFFF);
  static const Color lightSurface = Color(0xFFF7F7F7);
  static const Color lightSurfaceVariant = Color(0xFFF0F0F0);
  
  static const Color lightTextPrimary = Color(0xFF111111);
  static const Color lightTextSecondary = Color(0xFF6E6E6E);
  static const Color lightTextTertiary = Color(0xFF9E9E9E);
  
  static const Color lightDivider = Color(0xFFE0E0E0);
  static const Color lightBorder = Color(0xFFDDDDDD);
  
  // Dark Theme Colors
  static const Color darkPrimary = Color(0xFFFF4500);
  static const Color darkPrimaryVariant = Color(0xFFFF6A00);
  static const Color darkSecondary = Color(0xFFFFFFFF);
  static const Color darkSecondaryVariant = Color(0xFFEEEEEE);
  
  static const Color darkBackground = Color(0xFF0E0E0E);
  static const Color darkSurface = Color(0xFF1A1A1A);
  static const Color darkSurfaceVariant = Color(0xFF252525);
  
  static const Color darkTextPrimary = Color(0xFFFFFFFF);
  static const Color darkTextSecondary = Color(0xFFB2B2B2);
  static const Color darkTextTertiary = Color(0xFF7E7E7E);
  
  static const Color darkDivider = Color(0xFF2A2A2A);
  static const Color darkBorder = Color(0xFF333333);
  
  // Common Colors (используются в обеих темах)
  static const Color success = Color(0xFF4CAF50);
  static const Color successLight = Color(0xFF81C784);
  static const Color successDark = Color(0xFF388E3C);
  
  static const Color error = Color(0xFFE63946);
  static const Color errorLight = Color(0xFFEF5350);
  static const Color errorDark = Color(0xFFC62828);
  
  static const Color warning = Color(0xFFFF9800);
  static const Color warningLight = Color(0xFFFFB74D);
  static const Color warningDark = Color(0xFFF57C00);
  
  static const Color info = Color(0xFF2196F3);
  static const Color infoLight = Color(0xFF64B5F6);
  static const Color infoDark = Color(0xFF1976D2);
  
  // Social Media Colors
  static const Color youtube = Color(0xFFFF0000);
  static const Color instagram = Color(0xFFE1306C);
  static const Color facebook = Color(0xFF1877F2);
  static const Color twitter = Color(0xFF1DA1F2);
  static const Color telegram = Color(0xFF0088CC);
  
  // Special
  static const Color like = Color(0xFFE91E63);
  static const Color favorite = Color(0xFFFFC107);
  static const Color verified = Color(0xFF00BCD4);
  static const Color premium = Color(0xFFFFD700);
  
  // Gradients
  static const List<Color> primaryGradient = [
    Color(0xFFFF7A00),
    Color(0xFFFF4500),
  ];
  
  static const List<Color> successGradient = [
    Color(0xFF4CAF50),
    Color(0xFF388E3C),
  ];
  
  static const List<Color> premiumGradient = [
    Color(0xFFFFD700),
    Color(0xFFFF8C00),
  ];
  
  // Shadow Colors
  static Color lightShadow = Colors.black.withValues(alpha: 0.08);
  static Color darkShadow = Colors.black.withValues(alpha: 0.3);
  
  // Overlay Colors
  static Color lightOverlay = Colors.black.withValues(alpha: 0.5);
  static Color darkOverlay = Colors.black.withValues(alpha: 0.7);
  
  // Shimmer Colors (для skeleton loading)
  static const Color lightShimmerBase = Color(0xFFE0E0E0);
  static const Color lightShimmerHighlight = Color(0xFFF5F5F5);
  
  static const Color darkShimmerBase = Color(0xFF2A2A2A);
  static const Color darkShimmerHighlight = Color(0xFF3A3A3A);
}

