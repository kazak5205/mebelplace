import 'dart:ui';
import 'package:flutter/material.dart';
import '../../theme/liquid_glass_colors.dart';
import '../../theme/liquid_glass_text_styles.dart';

/// Базовый экран в glass стиле
class GlassScreenBase extends StatelessWidget {
  final Widget child;
  final String? title;
  final bool showAppBar;
  final bool showBackButton;
  final Color backgroundColor;
  final List<Widget>? actions;

  const GlassScreenBase({
    super.key,
    required this.child,
    this.title,
    this.showAppBar = false,
    this.showBackButton = true,
    this.backgroundColor = const Color(0xFF1A1A1A),
    this.actions,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: showAppBar
          ? AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              leading: showBackButton
                  ? IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.of(context).pop(),
                    )
                  : null,
              title: title != null
                  ? Text(
                      title!,
                      style: LiquidGlassTextStyles.h2.copyWith(color: Colors.white),
                    )
                  : null,
              actions: actions,
            )
          : null,
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              LiquidGlassColors.darkGlass,
              LiquidGlassColors.darkGlass.withValues(alpha: 0.8),
            ],
          ),
        ),
        child: child,
      ),
    );
  }
}
