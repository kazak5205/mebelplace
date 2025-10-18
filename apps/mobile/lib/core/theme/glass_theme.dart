/// Glass Theme for Flutter
/// Based on design-system/tokens.json
import 'dart:ui';
import 'package:flutter/material.dart';

class GlassTheme {
  GlassTheme._();

  // Colors
  static const Color primary = Color(0xFFFF6600);
  static const Color primaryDark = Color(0xFFFF4500);
  static const Color success = Color(0xFF00C853);
  static const Color error = Color(0xFFFF3D00);
  
  // Glass params
  static const double glassBlur = 16.0;
  static const double glassOpacity = 0.7;
  
  // Spacing
  static const double spacing2 = 8.0;
  static const double spacing4 = 16.0;
  static const double spacing6 = 24.0;
  
  // Border radius
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;
  
  // Animations
  static const int durationFast = 120;
  static const int durationDefault = 240;
  static const Curve defaultCurve = Cubic(0.2, 0.8, 0.2, 1.0);
  static const Curve springCurve = Cubic(0.68, -0.55, 0.265, 1.55);
  
  static ImageFilter glassBlurFilter() {
    return ImageFilter.blur(sigmaX: glassBlur, sigmaY: glassBlur);
  }
}
