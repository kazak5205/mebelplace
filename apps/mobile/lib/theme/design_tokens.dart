import 'package:flutter/material.dart';

/// Design Tokens - Single source of truth
/// Synced with /design-tokens.json v2.0.0
class DesignTokens {
  DesignTokens._();

  // ==================== COLORS ====================
  
  // Primary
  static const Color primaryOrange = Color(0xFFFF6600);
  static const Color primaryOrangeLight = Color(0xFFFF8533);
  static const Color primaryOrangeDark = Color(0xFFCC5200);
  
  // Neutral
  static const Color neutralBlack = Color(0xFF0E0E0E);
  static const Color neutralWhite = Color(0xFFFFFFFF);
  
  // Gray Scale
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF3F4F6);
  static const Color gray200 = Color(0xFFE5E7EB);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray400 = Color(0xFF9CA3AF);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray700 = Color(0xFF374151);
  static const Color gray800 = Color(0xFF1F2937);
  static const Color gray900 = Color(0xFF111827);
  
  // Glass
  static const Color glassLight = Color(0x1AFFFFFF); // rgba(255, 255, 255, 0.1)
  static const Color glassDark = Color(0x33000000); // rgba(0, 0, 0, 0.2)
  static const Color glassBorder = Color(0x33FFFFFF); // rgba(255, 255, 255, 0.2)
  
  // Semantic
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // ==================== TYPOGRAPHY ====================
  
  // Font Families
  static const String fontFamilyPrimary = '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif';
  static const String fontFamilyMono = 'SF Mono, Monaco, Cascadia Code, Courier New, monospace';
  
  // Font Sizes (sp)
  static const double fontSizeXs = 12.0;   // 0.75rem
  static const double fontSizeSm = 14.0;   // 0.875rem
  static const double fontSizeBase = 16.0; // 1rem
  static const double fontSizeLg = 18.0;   // 1.125rem
  static const double fontSizeXl = 20.0;   // 1.25rem
  static const double fontSize2xl = 24.0;  // 1.5rem
  static const double fontSize3xl = 30.0;  // 1.875rem
  static const double fontSize4xl = 36.0;  // 2.25rem
  
  // Font Weights
  static const FontWeight fontWeightNormal = FontWeight.w400;
  static const FontWeight fontWeightMedium = FontWeight.w500;
  static const FontWeight fontWeightSemibold = FontWeight.w600;
  static const FontWeight fontWeightBold = FontWeight.w700;
  
  // Line Heights
  static const double lineHeightTight = 1.25;
  static const double lineHeightNormal = 1.5;
  static const double lineHeightRelaxed = 1.75;
  
  // ==================== SPACING ====================
  
  static const double spacing0 = 0.0;
  static const double spacing1 = 4.0;   // 0.25rem
  static const double spacing2 = 8.0;   // 0.5rem
  static const double spacing3 = 12.0;  // 0.75rem
  static const double spacing4 = 16.0;  // 1rem
  static const double spacing5 = 20.0;  // 1.25rem
  static const double spacing6 = 24.0;  // 1.5rem
  static const double spacing8 = 32.0;  // 2rem
  static const double spacing10 = 40.0; // 2.5rem
  static const double spacing12 = 48.0; // 3rem
  static const double spacing16 = 64.0; // 4rem
  
  // ==================== BORDER RADIUS ====================
  
  static const double radiusNone = 0.0;
  static const double radiusSm = 2.0;   // 0.125rem
  static const double radiusBase = 4.0; // 0.25rem
  static const double radiusMd = 6.0;   // 0.375rem
  static const double radiusLg = 8.0;   // 0.5rem
  static const double radiusXl = 12.0;  // 0.75rem
  static const double radius2xl = 16.0; // 1rem
  static const double radiusFull = 9999.0;
  
  // ==================== SHADOWS ====================
  
  static const BoxShadow shadowSm = BoxShadow(
    color: Color(0x0D000000), // rgba(0, 0, 0, 0.05)
    offset: Offset(0, 1),
    blurRadius: 2,
  );
  
  static const List<BoxShadow> shadowBase = [
    BoxShadow(
      color: Color(0x1A000000), // rgba(0, 0, 0, 0.1)
      offset: Offset(0, 1),
      blurRadius: 3,
    ),
    BoxShadow(
      color: Color(0x0F000000), // rgba(0, 0, 0, 0.06)
      offset: Offset(0, 1),
      blurRadius: 2,
    ),
  ];
  
  static const List<BoxShadow> shadowMd = [
    BoxShadow(
      color: Color(0x1A000000),
      offset: Offset(0, 4),
      blurRadius: 6,
      spreadRadius: -1,
    ),
    BoxShadow(
      color: Color(0x0F000000),
      offset: Offset(0, 2),
      blurRadius: 4,
      spreadRadius: -1,
    ),
  ];
  
  static const List<BoxShadow> shadowLg = [
    BoxShadow(
      color: Color(0x1A000000),
      offset: Offset(0, 10),
      blurRadius: 15,
      spreadRadius: -3,
    ),
    BoxShadow(
      color: Color(0x0D000000),
      offset: Offset(0, 4),
      blurRadius: 6,
      spreadRadius: -2,
    ),
  ];
  
  static const BoxShadow shadowGlass = BoxShadow(
    color: Color(0x5E1F2687), // rgba(31, 38, 135, 0.37)
    offset: Offset(0, 8),
    blurRadius: 32,
  );
  
  // ==================== EFFECTS ====================
  
  // Blur
  static const double blurSm = 4.0;
  static const double blurBase = 8.0;
  static const double blurMd = 12.0;
  static const double blurLg = 16.0;
  static const double blurXl = 24.0;
  
  // Opacity
  static const double opacity0 = 0.0;
  static const double opacity10 = 0.1;
  static const double opacity20 = 0.2;
  static const double opacity40 = 0.4;
  static const double opacity60 = 0.6;
  static const double opacity80 = 0.8;
  static const double opacity100 = 1.0;
  
  // ==================== ANIMATION ====================
  
  // Duration
  static const Duration durationFast = Duration(milliseconds: 120);
  static const Duration durationDefault = Duration(milliseconds: 240);
  static const Duration durationLong = Duration(milliseconds: 360);
  static const Duration durationXl = Duration(milliseconds: 600);
  
  // Easing (Cubic Bezier)
  static const Cubic easingDefault = Cubic(0.2, 0.8, 0.2, 1.0);
  static const Cubic easingIn = Cubic(0.4, 0.0, 1.0, 1.0);
  static const Cubic easingOut = Cubic(0.0, 0.0, 0.2, 1.0);
  
  // ==================== BREAKPOINTS ====================
  
  static const double breakpointSm = 640.0;
  static const double breakpointMd = 768.0;
  static const double breakpointLg = 1024.0;
  static const double breakpointXl = 1280.0;
  static const double breakpoint2xl = 1536.0;
  
  // ==================== HELPER METHODS ====================
  
  static bool isSmallScreen(BuildContext context) {
    return MediaQuery.of(context).size.width < breakpointSm;
  }
  
  static bool isMediumScreen(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= breakpointSm && width < breakpointMd;
  }
  
  static bool isLargeScreen(BuildContext context) {
    return MediaQuery.of(context).size.width >= breakpointMd;
  }
}

