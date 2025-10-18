import 'package:flutter/material.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassFeaturesPage extends StatelessWidget {
  const GlassFeaturesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              ...[
                {'icon': Icons.video_library_outlined, 'title': 'Видео от мастеров', 'desc': 'Смотрите работы и выбирайте лучших'},
                {'icon': Icons.work_outline, 'title': 'Создавайте заявки', 'desc': 'Опишите задачу - получите предложения'},
                {'icon': Icons.chat_bubble_outline, 'title': 'Общайтесь напрямую', 'desc': 'Чат с мастерами в реальном времени'},
              ].map((f) => Padding(
                padding: const EdgeInsets.only(bottom: 24),
                child: GlassPanel(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: LiquidGlassColors.primaryOrange.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(f['icon'] as IconData, size: 32, color: LiquidGlassColors.primaryOrange),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(f['title'] as String, style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black, fontWeight: FontWeight.w600)),
                            Text(f['desc'] as String, style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              )),
              const Spacer(),
              GlassButton.primary('Далее', onTap: () => Navigator.pushReplacementNamed(context, '/auth/register')),
              const SizedBox(height: 16),
              GlassButton.secondary('Пропустить', onTap: () => Navigator.pushReplacementNamed(context, '/auth/login')),
            ],
          ),
        ),
      ),
    );
  }
}

