import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassSupportScreen extends ConsumerStatefulWidget {
  const GlassSupportScreen({super.key});

  @override
  ConsumerState<GlassSupportScreen> createState() => _GlassSupportScreenState();
}

class _GlassSupportScreenState extends ConsumerState<GlassSupportScreen> {
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Поддержка', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassPanel(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Обратитесь в поддержку', style: LiquidGlassTextStyles.h2Light(context)),
                const SizedBox(height: 24),
                GlassTextField(hint: 'Тема обращения', controller: _subjectController),
                const SizedBox(height: 16),
                GlassTextField(hint: 'Опишите проблему...', controller: _messageController, maxLines: 8),
                const SizedBox(height: 24),
                GlassButton.primary('Отправить', onTap: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Тикет создан! Мы свяжемся с вами.'), backgroundColor: LiquidGlassColors.success),
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassPanel(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                const Icon(Icons.email_outlined, size: 48, color: LiquidGlassColors.primaryOrange),
                const SizedBox(height: 16),
                Text('support@mebelplace.kz', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                const SizedBox(height: 8),
                Text('Время ответа: до 24 часов', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

