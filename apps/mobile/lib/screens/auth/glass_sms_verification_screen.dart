import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

/// Glass SMS Verification Screen
class GlassSmsVerificationScreen extends ConsumerStatefulWidget {
  final String phone;

  const GlassSmsVerificationScreen({
    super.key,
    required this.phone,
  });

  @override
  ConsumerState<GlassSmsVerificationScreen> createState() => _GlassSmsVerificationScreenState();
}

class _GlassSmsVerificationScreenState extends ConsumerState<GlassSmsVerificationScreen> {
  final List<TextEditingController> _codeControllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
                  LiquidGlassColors.primaryOrange.withValues(alpha: 0.15),
                  isDark ? Colors.black : Colors.white,
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
                      // Icon
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: LiquidGlassColors.primaryOrange.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.sms_outlined,
                          size: 48,
                          color: LiquidGlassColors.primaryOrange,
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Title
                      Text(
                        'Введите код',
                        style: LiquidGlassTextStyles.h2Light(context),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Отправлен на ${widget.phone}',
                        style: LiquidGlassTextStyles.bodySecondary(isDark),
                        textAlign: TextAlign.center,
                      ),

                      const SizedBox(height: 32),

                      // Code input (6 digits)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: List.generate(6, (index) {
                          return SizedBox(
                            width: 50,
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: BackdropFilter(
                                filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? Colors.white.withValues(alpha: 0.1)
                                        : Colors.white.withValues(alpha: 0.6),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.2)
                                          : Colors.black.withValues(alpha: 0.1),
                                    ),
                                  ),
                                  child: TextField(
                                    controller: _codeControllers[index],
                                    focusNode: _focusNodes[index],
                                    textAlign: TextAlign.center,
                                    keyboardType: TextInputType.number,
                                    maxLength: 1,
                                    style: TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.w600,
                                      color: isDark ? Colors.white : Colors.black,
                                    ),
                                    decoration: const InputDecoration(
                                      border: InputBorder.none,
                                      counterText: '',
                                    ),
                                    onChanged: (value) {
                                      if (value.length == 1 && index < 5) {
                                        _focusNodes[index + 1].requestFocus();
                                      }
                                    },
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),

                      const SizedBox(height: 32),

                      // Verify button
                      GlassButton.primary(
                        'Подтвердить',
                        isLoading: _isLoading,
                        onTap: () async {
                          setState(() => _isLoading = true);
                          await Future.delayed(const Duration(seconds: 2));
                          setState(() => _isLoading = false);

                          if (context.mounted) {
                            Navigator.pushReplacementNamed(context, '/');
                          }
                        },
                      ),

                      const SizedBox(height: 16),

                      // Resend
                      TextButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Код отправлен повторно'),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                        child: Text(
                          'Отправить код повторно',
                          style: LiquidGlassTextStyles.body.copyWith(
                            color: LiquidGlassColors.primaryOrange,
                          ),
                        ),
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
    for (var controller in _codeControllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }
}

