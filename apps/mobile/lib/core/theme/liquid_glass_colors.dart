import 'package:flutter/material.dart';

/// Liquid Glass color palette for MebelPlace app
/// These colors provide a modern, glass-like appearance
class LiquidGlassColors {
  LiquidGlassColors._();

  // ========== PRIMARY COLORS ==========
  static const Color primary = Color(0xFF6366F1); // Indigo
  static const Color primaryLight = Color(0xFF818CF8);
  static const Color primaryDark = Color(0xFF4F46E5);

  // ========== SECONDARY COLORS ==========
  static const Color secondary = Color(0xFF10B981); // Emerald
  static const Color secondaryLight = Color(0xFF34D399);
  static const Color secondaryDark = Color(0xFF059669);

  // ========== ACCENT COLORS ==========
  static const Color accent = Color(0xFFF59E0B); // Amber
  static const Color accentLight = Color(0xFFFCD34D);
  static const Color accentDark = Color(0xFFD97706);
  static const Color primaryOrange = Color(0xFFFF7A00); // MebelPlace brand color
  static const Color darkGlass = Color(0x40000000); // Dark glass effect
  static const Color darkGlassBorder = Color(0x40FFFFFF); // Dark glass border
  static const Color darkGlassShadow = Color(0x80000000); // Dark glass shadow

  // ========== GLASS EFFECT COLORS ==========
  static const Color glassWhite = Color(0x40FFFFFF);
  static const Color glassBlack = Color(0x40000000);
  static const Color glassPrimary = Color(0x406366F1);
  static const Color glassSecondary = Color(0x4010B981);

  // ========== BACKGROUND COLORS ==========
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color backgroundDark = Color(0xFF0F172A);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF1E293B);

  // ========== TEXT COLORS ==========
  static const Color textPrimary = Color(0xFF1F2937);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textLight = Color(0xFF9CA3AF);
  static const Color textOnDark = Color(0xFFF9FAFB);

  // ========== STATUS COLORS ==========
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // ========== NEUTRAL COLORS ==========
  static const Color neutral50 = Color(0xFFF9FAFB);
  static const Color neutral100 = Color(0xFFF3F4F6);
  static const Color neutral200 = Color(0xFFE5E7EB);
  static const Color neutral300 = Color(0xFFD1D5DB);
  static const Color neutral400 = Color(0xFF9CA3AF);
  static const Color neutral500 = Color(0xFF6B7280);
  static const Color neutral600 = Color(0xFF4B5563);
  static const Color neutral700 = Color(0xFF374151);
  static const Color neutral800 = Color(0xFF1F2937);
  static const Color neutral900 = Color(0xFF111827);

  // ========== GRADIENT COLORS ==========
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondary, secondaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient glassGradient = LinearGradient(
    colors: [glassWhite, glassPrimary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ========== GLASS EFFECT HELPERS ==========
  
  /// Get glass color with opacity
  static Color glassColor(Color baseColor, double opacity) {
    return baseColor.withOpacity(opacity);
  }

  /// Get glass background color
  static Color getGlassBackground(bool isDark) {
    return isDark ? glassBlack : glassWhite;
  }

  /// Get glass border color
  static Color getGlassBorder(bool isDark) {
    return isDark ? neutral700.withOpacity(0.3) : neutral200.withOpacity(0.5);
  }
  
  // ========== ADDITIONAL COLORS FOR COMPATIBILITY ==========
  static const Color primaryOrangeLight = Color(0xFFFF8844);
  static const Color errorRed = Color(0xFFFF4444);
}