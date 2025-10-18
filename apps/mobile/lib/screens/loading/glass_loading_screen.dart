import 'package:flutter/material.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassLoadingScreen extends StatelessWidget {
  const GlassLoadingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LiquidGlassColors.primaryGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.carpenter, size: 64, color: Colors.white),
            ),
            const SizedBox(height: 32),
            const CircularProgressIndicator(color: LiquidGlassColors.primaryOrange, strokeWidth: 3),
            const SizedBox(height: 24),
            Text('MebelPlace', style: LiquidGlassTextStyles.h2.copyWith(color: Colors.white)),
          ],
        ),
      ),
    );
  }
}

