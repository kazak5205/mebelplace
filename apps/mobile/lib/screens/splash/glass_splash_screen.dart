import 'package:flutter/material.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassSplashScreen extends StatelessWidget {
  const GlassSplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: const BoxDecoration(
                gradient: LiquidGlassColors.primaryGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.carpenter, size: 60, color: Colors.white),
            ),
            const SizedBox(height: 32),
            Text('MebelPlace', style: LiquidGlassTextStyles.h1.copyWith(color: Colors.white, fontSize: 32)),
            const SizedBox(height: 8),
            Text('Ваша мебель мечты', style: LiquidGlassTextStyles.body.copyWith(color: Colors.white70)),
          ],
        ),
      ),
    );
  }
}

