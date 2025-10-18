import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/widgets/glass/glass_chip.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassConfiguratorScreen extends ConsumerStatefulWidget {
  const GlassConfiguratorScreen({super.key});

  @override
  ConsumerState<GlassConfiguratorScreen> createState() => _GlassConfiguratorScreenState();
}

class _GlassConfiguratorScreenState extends ConsumerState<GlassConfiguratorScreen> {
  String _furnitureType = 'шкаф';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Конфигуратор мебели', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 60,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.all(16),
              children: [
                GlassChip(label: 'Шкаф', isActive: _furnitureType == 'шкаф', onTap: () => setState(() => _furnitureType = 'шкаф')),
                const SizedBox(width: 8),
                GlassChip(label: 'Стол', isActive: _furnitureType == 'стол', onTap: () => setState(() => _furnitureType = 'стол')),
                const SizedBox(width: 8),
                GlassChip(label: 'Кровать', isActive: _furnitureType == 'кровать', onTap: () => setState(() => _furnitureType = 'кровать')),
              ],
            ),
          ),
          Expanded(
            child: Center(
              child: GlassPanel(
                margin: const EdgeInsets.all(24),
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.view_in_ar, size: 80, color: LiquidGlassColors.primaryOrange),
                    const SizedBox(height: 24),
                    Text('3D модель $_furnitureType', style: LiquidGlassTextStyles.h2Light(context)),
                    const SizedBox(height: 32),
                    GlassButton.primary('Настроить размеры', onTap: () {}),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

