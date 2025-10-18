import 'dart:ui';
import 'package:flutter/material.dart';

/// Glass Button - Primary (с градиентом оранжевого)
class GlassButton extends StatelessWidget {
  final String text;
  final VoidCallback? onTap;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final bool isPrimary;
  final Widget? icon;
  final bool isLoading;

  const GlassButton({
    super.key,
    required this.text,
    this.onTap,
    this.borderRadius = 12,
    this.padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
    this.isPrimary = true,
    this.icon,
    this.isLoading = false,
  });

  factory GlassButton.primary(
    String text, {
    VoidCallback? onTap,
    Widget? icon,
    bool isLoading = false,
  }) {
    return GlassButton(
      text: text,
      onTap: onTap,
      isPrimary: true,
      icon: icon,
      isLoading: isLoading,
    );
  }

  factory GlassButton.secondary(
    String text, {
    VoidCallback? onTap,
    Widget? icon,
    bool isLoading = false,
  }) {
    return GlassButton(
      text: text,
      onTap: onTap,
      isPrimary: false,
      icon: icon,
      isLoading: isLoading,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (isPrimary) {
      return _buildPrimaryButton(context);
    } else {
      return _buildSecondaryButton(context, isDark);
    }
  }

  Widget _buildPrimaryButton(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isLoading ? null : (onTap ?? () {
          print('🔘 GlassButton onTap called with fallback!');
        }),
        borderRadius: BorderRadius.circular(borderRadius),
        child: Ink(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFFFF6600),
                Color(0xFFFF8833),
              ],
            ),
            borderRadius: BorderRadius.circular(borderRadius),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFFF6600).withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Container(
            padding: padding,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  icon!,
                  const SizedBox(width: 8),
                ],
                if (isLoading)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                else
                  Text(
                    text,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSecondaryButton(BuildContext context, bool isDark) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isLoading ? null : (onTap ?? () {}),
            child: Ink(
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.1)
                    : Colors.white.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(borderRadius),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.3)
                      : Colors.black.withValues(alpha: 0.1),
                  width: 1,
                ),
              ),
              child: Container(
                padding: padding,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (icon != null) ...[
                      icon!,
                      const SizedBox(width: 8),
                    ],
                    if (isLoading)
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: isDark ? Colors.white : Colors.black,
                          strokeWidth: 2,
                        ),
                      )
                    else
                      Text(
                        text,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: isDark ? Colors.white : Colors.black,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Glass Icon Button (для правой панели видео)
class GlassIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final String? count;
  final double size;
  final Color? iconColor;

  const GlassIconButton({
    super.key,
    required this.icon,
    this.onTap,
    this.count,
    this.size = 24,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                  child: Icon(
                    icon,
                    size: size,
                    color: iconColor ?? Colors.white.withValues(alpha: 0.9),
                  ),
                ),
              ),
            ),
          ),
        ),
        if (count != null) ...[
          const SizedBox(height: 4),
          Text(
            count!,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: Colors.white.withValues(alpha: 0.9),
            ),
          ),
        ],
      ],
    );
  }
}

