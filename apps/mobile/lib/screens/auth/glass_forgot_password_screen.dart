import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/auth/presentation/providers/forgot_password_provider.dart';

class GlassForgotPasswordScreen extends ConsumerStatefulWidget {
  const GlassForgotPasswordScreen({super.key});

  @override
  ConsumerState<GlassForgotPasswordScreen> createState() => _GlassForgotPasswordScreenState();
}

class _GlassForgotPasswordScreenState extends ConsumerState<GlassForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _isSending = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: GlassPanel(
                padding: const EdgeInsets.all(32),
                borderRadius: 24,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        gradient: LiquidGlassColors.primaryGradient,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.lock_reset, size: 48, color: Colors.white),
                    ),
                    const SizedBox(height: 24),
                    Text('Восстановление пароля', style: LiquidGlassTextStyles.h2Light(context)),
                    const SizedBox(height: 8),
                    Text(
                      'Введите email для восстановления',
                      style: LiquidGlassTextStyles.bodySecondary(isDark),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    GlassTextField(
                      hint: 'Email',
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 24),
                    GlassButton.primary(
                      'Отправить',
                      isLoading: _isSending,
                      onTap: () async {
                        if (_emailController.text.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Введите email'), backgroundColor: LiquidGlassColors.error),
                          );
                          return;
                        }

                        setState(() => _isSending = true);

                        final success = await ref.read(forgotPasswordProvider.notifier).sendResetLink(_emailController.text);

                        if (context.mounted) {
                          setState(() => _isSending = false);
                          if (success) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Письмо отправлено на email!'), backgroundColor: LiquidGlassColors.success),
                            );
                            Navigator.pop(context);
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Ошибка отправки'), backgroundColor: LiquidGlassColors.error),
                            );
                          }
                        }
                      },
                    ),
                    const SizedBox(height: 16),
                    GlassButton.secondary('Назад', onTap: () => Navigator.pop(context)),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }
}
