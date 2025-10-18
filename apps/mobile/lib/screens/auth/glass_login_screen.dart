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
import 'glass_register_screen.dart';

/// Glass Login Screen - Liquid Glass дизайн
class GlassLoginScreen extends ConsumerStatefulWidget {
  const GlassLoginScreen({super.key});

  @override
  ConsumerState<GlassLoginScreen> createState() => _GlassLoginScreenState();
}

class _GlassLoginScreenState extends ConsumerState<GlassLoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

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
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  LiquidGlassColors.primaryOrange.withValues(alpha: 0.2),
                  isDark ? Colors.black : Colors.white,
                  LiquidGlassColors.primaryOrangeLight.withValues(alpha: 0.1),
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
                      // Logo/Title
                      Text(
                        'MebelPlace',
                        style: LiquidGlassTextStyles.h1.copyWith(
                          color: LiquidGlassColors.primaryOrange,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Войдите в аккаунт',
                        style: LiquidGlassTextStyles.bodySecondary(isDark),
                        textAlign: TextAlign.center,
                      ),

                      const SizedBox(height: 40),

                      // Email
                      GlassTextField(
                        hint: 'Email или телефон',
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        prefixIcon: Icon(
                          Icons.person_outline,
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.6)
                              : Colors.black.withValues(alpha: 0.6),
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
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.6)
                              : Colors.black.withValues(alpha: 0.6),
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.6)
                                : Colors.black.withValues(alpha: 0.6),
                          ),
                          onPressed: () {
                            setState(() => _obscurePassword = !_obscurePassword);
                          },
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Forgot password
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {
                            // TODO: Navigate to forgot password screen
                            Navigator.pushNamed(context, '/auth/forgot-password');
                          },
                          child: Text(
                            'Забыли пароль?',
                            style: LiquidGlassTextStyles.bodySmall.copyWith(
                              color: LiquidGlassColors.primaryOrange,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Login button
                      GlassButton.primary(
                        'Войти',
                        isLoading: isLoading,
                        onTap: () async {
                          if (isLoading) return;
                          if (_emailController.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Введите email или телефон')),
                            );
                            return;
                          }
                          
                          if (_passwordController.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Введите пароль')),
                            );
                            return;
                          }
                          
                          final success = await ref.read(appStateProvider.notifier).login(
                                emailOrPhone: _emailController.text.trim(),
                                password: _passwordController.text.trim(),
                              );
                              
                          // Проверяем результат логина
                          if (success) {
                            // Успешный логин - переходим на главную страницу
                            if (context.mounted) {
                              context.go('/main');
                            }
                          } else {
                            // Ошибка логина
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Ошибка входа')),
                              );
                            }
                          }
                        },
                      ),

                      const SizedBox(height: 16),

                      // Register link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Нет аккаунта? ',
                            style: LiquidGlassTextStyles.bodySecondary(isDark),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const GlassRegisterScreen(),
                                ),
                              );
                            },
                            child: Text(
                              'Регистрация',
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
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}

