import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassUserProfileScreen extends ConsumerWidget {
  final String userId;

  const GlassUserProfileScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Профиль', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassPanel(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                CircleAvatar(radius: 50, backgroundColor: LiquidGlassColors.primaryOrange, child: Text('U$userId', style: const TextStyle(color: Colors.white, fontSize: 24))),
                const SizedBox(height: 16),
                Text('User $userId', style: LiquidGlassTextStyles.h2Light(context)),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _Stat('12', 'Видео', isDark),
                    _Stat('456', 'Подписчики', isDark),
                    _Stat('89', 'Подписки', isDark),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String value;
  final String label;
  final bool isDark;

  const _Stat(this.value, this.label, this.isDark);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: LiquidGlassTextStyles.h2.copyWith(color: LiquidGlassColors.primaryOrange)),
        Text(label, style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
      ],
    );
  }
}

