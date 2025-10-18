import 'package:flutter/material.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassErrorScreen extends StatelessWidget {
  final String error;

  const GlassErrorScreen({super.key, required this.error});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: Center(
        child: GlassPanel(
          margin: const EdgeInsets.all(24),
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 80, color: LiquidGlassColors.error),
              const SizedBox(height: 24),
              Text('Ошибка', style: LiquidGlassTextStyles.h2Light(context)),
              const SizedBox(height: 16),
              Text(error, style: LiquidGlassTextStyles.bodySecondary(isDark), textAlign: TextAlign.center),
              const SizedBox(height: 32),
              GlassButton.primary('Вернуться', onTap: () => Navigator.pop(context)),
            ],
          ),
        ),
      ),
    );
  }
}

