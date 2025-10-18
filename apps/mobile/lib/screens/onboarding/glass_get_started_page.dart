import 'package:flutter/material.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassGetStartedPage extends StatelessWidget {
  const GlassGetStartedPage({super.key});

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
                decoration: const BoxDecoration(gradient: LiquidGlassColors.primaryGradient, shape: BoxShape.circle),
                child: const Icon(Icons.rocket_launch, size: 80, color: Colors.white),
              ),
              const SizedBox(height: 48),
              Text('Начнём!', style: LiquidGlassTextStyles.h1.copyWith(color: LiquidGlassColors.primaryOrange)),
              const SizedBox(height: 16),
              Text('Найдите лучших мастеров для вашей мебели', style: LiquidGlassTextStyles.bodySecondary(isDark), textAlign: TextAlign.center),
              const SizedBox(height: 64),
              GlassButton.primary('Зарегистрироваться', onTap: () => Navigator.pushReplacementNamed(context, '/auth/register')),
              const SizedBox(height: 16),
              GlassButton.secondary('Уже есть аккаунт', onTap: () => Navigator.pushReplacementNamed(context, '/auth/login')),
            ],
          ),
        ),
      ),
    );
  }
}

