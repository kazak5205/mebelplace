import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassInteriorConfiguratorScreen extends ConsumerWidget {
  const GlassInteriorConfiguratorScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Дизайн интерьера', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Center(
        child: GlassPanel(
          margin: const EdgeInsets.all(24),
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.architecture, size: 80, color: LiquidGlassColors.primaryOrange),
              const SizedBox(height: 24),
              Text('3D Визуализация', style: LiquidGlassTextStyles.h2Light(context)),
              const SizedBox(height: 16),
              Text('Создайте интерьер своей мечты', style: LiquidGlassTextStyles.bodySecondary(isDark), textAlign: TextAlign.center),
              const SizedBox(height: 32),
              GlassButton.primary('Начать проектирование', onTap: () {}),
            ],
          ),
        ),
      ),
    );
  }
}

