import 'package:flutter/material.dart';

class AccessibilityHelper {
  static bool isReduceMotionEnabled(BuildContext context) {
    return MediaQuery.of(context).disableAnimations;
  }

  static bool isAccessibleNavigationEnabled(BuildContext context) {
    return MediaQuery.of(context).accessibleNavigation;
  }

  static Duration getAnimationDuration(BuildContext context, Duration defaultDuration) {
    return isReduceMotionEnabled(context) ? Duration.zero : defaultDuration;
  }

  static Widget withSemantics({
    required Widget child,
    required String label,
    String? hint,
    bool? button,
    bool? link,
    VoidCallback? onTap,
  }) {
    return Semantics(
      label: label,
      hint: hint,
      button: button ?? false,
      link: link ?? false,
      onTap: onTap,
      child: child,
    );
  }

  static bool checkContrastRatio(Color foreground, Color background, {double minimum = 4.5}) {
    final ratio = _calculateContrastRatio(foreground, background);
    return ratio >= minimum;
  }

  static double _calculateContrastRatio(Color color1, Color color2) {
    final l1 = _relativeLuminance(color1);
    final l2 = _relativeLuminance(color2);
    final lighter = l1 > l2 ? l1 : l2;
    final darker = l1 > l2 ? l2 : l1;
    return (lighter + 0.05) / (darker + 0.05);
  }

  static double _relativeLuminance(Color color) {
    final r = _sRGBtoLinear(color.red / 255.0);
    final g = _sRGBtoLinear(color.green / 255.0);
    final b = _sRGBtoLinear(color.blue / 255.0);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  static double _sRGBtoLinear(double value) {
    if (value <= 0.03928) {
      return value / 12.92;
    } else {
      return ((value + 0.055) / 1.055) * ((value + 0.055) / 1.055);
    }
  }
}


