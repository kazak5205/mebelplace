import 'package:flutter/material.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassWelcomePage extends StatelessWidget {
  const GlassWelcomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(40),
                decoration: BoxDecoration(
                  gradient: LiquidGlassColors.primaryGradient,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.carpenter, size: 80, color: Colors.white),
              ),
              const SizedBox(height: 48),
              Text('Добро пожаловать в', style: LiquidGlassTextStyles.h2Light(context), textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text('MebelPlace', style: LiquidGlassTextStyles.h1.copyWith(color: LiquidGlassColors.primaryOrange), textAlign: TextAlign.center),
              const SizedBox(height: 16),
              Text(
                'Маркетплейс мебели и мастеров',
                style: LiquidGlassTextStyles.bodySecondary(isDark),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 64),
              GlassButton.primary('Начать', onTap: () => Navigator.pushReplacementNamed(context, '/onboarding/features')),
            ],
          ),
        ),
      ),
    );
  }
}

