import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/requests/presentation/providers/proposals_provider.dart';

class GlassCreateProposalScreen extends ConsumerStatefulWidget {
  final String requestId;

  const GlassCreateProposalScreen({super.key, required this.requestId});

  @override
  ConsumerState<GlassCreateProposalScreen> createState() => _GlassCreateProposalScreenState();
}

class _GlassCreateProposalScreenState extends ConsumerState<GlassCreateProposalScreen> {
  final _priceController = TextEditingController();
  final _daysController = TextEditingController();
  final _messageController = TextEditingController();
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Откликнуться на заявку', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassPanel(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Ваше предложение', style: LiquidGlassTextStyles.h2Light(context)),
                const SizedBox(height: 24),
                GlassTextField(
                  hint: 'Цена (₸)',
                  controller: _priceController,
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                GlassTextField(
                  hint: 'Срок (дней)',
                  controller: _daysController,
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                GlassTextField(
                  hint: 'Сообщение клиенту',
                  controller: _messageController,
                  maxLines: 4,
                ),
                const SizedBox(height: 24),
                GlassButton.primary(
                  'Отправить',
                  isLoading: _isSubmitting,
                  onTap: () async {
                    if (_priceController.text.isEmpty || _daysController.text.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Заполните все обязательные поля'), backgroundColor: LiquidGlassColors.error),
                      );
                      return;
                    }

                    setState(() => _isSubmitting = true);

                    await Future.delayed(const Duration(seconds: 1));

                    if (context.mounted) {
                      setState(() => _isSubmitting = false);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Отклик отправлен!'), backgroundColor: LiquidGlassColors.success),
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _priceController.dispose();
    _daysController.dispose();
    _messageController.dispose();
    super.dispose();
  }
}
