import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../core/providers/app_state_provider.dart';

/// Glass Register Screen
class GlassRegisterScreen extends ConsumerStatefulWidget {
  const GlassRegisterScreen({super.key});

  @override
  ConsumerState<GlassRegisterScreen> createState() => _GlassRegisterScreenState();
}

class _GlassRegisterScreenState extends ConsumerState<GlassRegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _agreedToTerms = true; // Временно для тестирования

  @override
  void initState() {
    super.initState();
    // Форма готова для заполнения пользователем
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authState = ref.watch(appStateProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: Stack(
        children: [
          // Gradient background
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
                colors: [
                  LiquidGlassColors.primaryOrangeLight.withValues(alpha: 0.2),
                  isDark ? Colors.black : Colors.white,
                  LiquidGlassColors.primaryOrange.withValues(alpha: 0.1),
                ],
              ),
            ),
          ),

          // Content
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: GlassPanel(
                  padding: const EdgeInsets.all(32),
                  borderRadius: 32,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Title
                      Text(
                        'Регистрация',
                        style: LiquidGlassTextStyles.h1Light(context),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Создайте новый аккаунт',
                        style: LiquidGlassTextStyles.bodySecondary(isDark),
                        textAlign: TextAlign.center,
                      ),

                      const SizedBox(height: 32),

                      // Name
                      GlassTextField(
                        hint: 'Имя',
                        controller: _nameController,
                        prefixIcon: Icon(
                          Icons.person_outline,
                          color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Email
                      GlassTextField(
                        hint: 'Email',
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        prefixIcon: Icon(
                          Icons.email_outlined,
                          color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Phone
                      GlassTextField(
                        hint: 'Телефон',
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        prefixIcon: Icon(
                          Icons.phone_outlined,
                          color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Password
                      GlassTextField(
                        hint: 'Пароль',
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        prefixIcon: Icon(
                          Icons.lock_outline,
                          color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Confirm Password
                      GlassTextField(
                        hint: 'Подтвердите пароль',
                        controller: _confirmPasswordController,
                        obscureText: _obscureConfirm,
                        prefixIcon: Icon(
                          Icons.lock_outline,
                          color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureConfirm ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                          ),
                          onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Terms checkbox
                      Row(
                        children: [
                          Checkbox(
                            value: _agreedToTerms,
                            onChanged: (value) => setState(() => _agreedToTerms = value ?? false),
                            activeColor: LiquidGlassColors.primaryOrange,
                          ),
                          Expanded(
                            child: Text(
                              'Согласен с условиями использования',
                              style: LiquidGlassTextStyles.bodySmall.copyWith(
                                color: isDark ? Colors.white : Colors.black,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Register button
                      GlassButton.primary(
                        'Зарегистрироваться',
                        isLoading: isLoading,
                        onTap: () async {
                          if (isLoading) return;
                          // Регистрация пользователя
                          
                          // Проверяем согласие с условиями
                          if (!_agreedToTerms) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Необходимо согласиться с условиями использования')),
                            );
                            return;
                          }
                                // Валидация
                                if (_nameController.text.trim().isEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Введите имя')),
                                  );
                                  return;
                                }
                                
                                if (_emailController.text.trim().isEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Введите email')),
                                  );
                                  return;
                                }
                                
                                if (_passwordController.text.trim().isEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Введите пароль')),
                                  );
                                  return;
                                }
                                
                                if (_passwordController.text != _confirmPasswordController.text) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Пароли не совпадают')),
                                  );
                                  return;
                                }
                                
                                final success = await ref.read(appStateProvider.notifier).register(
                                      name: _nameController.text.trim(),
                                      email: _emailController.text.trim(),
                                      phone: _phoneController.text.trim().isEmpty ? null : _phoneController.text.trim(),
                                      password: _passwordController.text.trim(),
                                    );
                                if (success) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Регистрация успешна!'),
                                      backgroundColor: Colors.green,
                                    ),
                                  );
                                  if (context.mounted) {
                                    Navigator.pop(context);
                                  }
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Ошибка регистрации')),
                                  );
                                }
                              },
                      ),

                      const SizedBox(height: 16),

                      // Login link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Уже есть аккаунт? ',
                            style: LiquidGlassTextStyles.bodySecondary(isDark),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context);
                            },
                            child: Text(
                              'Войти',
                              style: LiquidGlassTextStyles.body.copyWith(
                                color: LiquidGlassColors.primaryOrange,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}

