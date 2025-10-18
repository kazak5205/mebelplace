import 'package:flutter/material.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassAnimationsDemoScreen extends StatelessWidget {
  const GlassAnimationsDemoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Демо анимаций', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Center(
        child: GlassPanel(
          margin: const EdgeInsets.all(24),
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.animation, size: 80, color: LiquidGlassColors.primaryOrange),
              const SizedBox(height: 24),
              Text('Liquid Glass Animations', style: LiquidGlassTextStyles.h2Light(context)),
              const SizedBox(height: 16),
              Text('Плавные переходы, bounce эффекты, blur', style: LiquidGlassTextStyles.bodySecondary(isDark), textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

