import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';
import '../core/widgets/glass/glass_panel.dart';
import '../core/widgets/glass/glass_button.dart';
import '../core/widgets/glass/glass_text_field.dart';
import '../core/theme/liquid_glass_colors.dart';
import '../core/theme/liquid_glass_text_styles.dart';
import '../features/requests/presentation/providers/requests_provider.dart';
import '../features/requests/domain/entities/request_entity.dart';

/// Glass Request Screen (Создание заявки)
class GlassRequestScreen extends ConsumerStatefulWidget {
  const GlassRequestScreen({super.key});

  @override
  ConsumerState<GlassRequestScreen> createState() => _GlassRequestScreenState();
}

class _GlassRequestScreenState extends ConsumerState<GlassRequestScreen> {
  int _currentStep = 0;
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _selectedRegion = 'Алматы';
  List<String> _photos = [];
  bool _isCreating = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: Stack(
        children: [
          // Blurred background
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  LiquidGlassColors.primaryOrange.withValues(alpha: 0.1),
                  isDark ? Colors.black : Colors.white,
                ],
              ),
            ),
          ),

          // Form
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: GlassPanel(
                    padding: const EdgeInsets.all(24),
                    borderRadius: 24,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Progress
                        Row(
                          children: List.generate(3, (index) {
                            return Expanded(
                              child: Container(
                                height: 4,
                                margin: EdgeInsets.only(
                                  left: index == 0 ? 0 : 4,
                                  right: index == 2 ? 0 : 4,
                                ),
                                decoration: BoxDecoration(
                                  color: index <= _currentStep
                                      ? LiquidGlassColors.primaryOrange
                                      : (isDark
                                          ? Colors.white.withValues(alpha: 0.2)
                                          : Colors.black.withValues(alpha: 0.2)),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            );
                          }),
                        ),

                        const SizedBox(height: 32),

                        // Title
                        Text(
                          _getStepTitle(),
                          style: LiquidGlassTextStyles.h2Light(context),
                          textAlign: TextAlign.center,
                        ),

                        const SizedBox(height: 24),

                        // Step content
                        _buildStepContent(isDark),

                        const SizedBox(height: 32),

                        // Buttons
                        Row(
                          children: [
                            if (_currentStep > 0)
                              Expanded(
                                child: GlassButton.secondary(
                                  'Назад',
                                  onTap: () {
                                    setState(() => _currentStep--);
                                  },
                                ),
                              ),
                            if (_currentStep > 0) const SizedBox(width: 12),
                            Expanded(
                              child: GlassButton.primary(
                                _currentStep == 2 ? 'Создать' : 'Далее',
                                isLoading: _isCreating,
                                onTap: () async {
                                  if (_currentStep == 2) {
                                    setState(() => _isCreating = true);
                                    
                                    final success = await ref
                                        .read(requestsProvider.notifier)
                                        .createRequest(
                                          title: _titleController.text.trim(),
                                          description: _descriptionController.text.trim(),
                                          region: _selectedRegion,
                                          photos: _photos,
                                        );
                                    
                                    setState(() => _isCreating = false);
                                    
                                    if (success && context.mounted) {
                                      Navigator.pop(context);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('Заявка создана!'),
                                          backgroundColor: LiquidGlassColors.success,
                                        ),
                                      );
                                    }
                                  } else {
                                    setState(() => _currentStep++);
                                  }
                                },
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
          ),
        ],
      ),
    );
  }

  String _getStepTitle() {
    switch (_currentStep) {
      case 0:
        return 'Опишите заявку';
      case 1:
        return 'Добавьте фото';
      case 2:
        return 'Выберите регион';
      default:
        return '';
    }
  }

  Widget _buildStepContent(bool isDark) {
    switch (_currentStep) {
      case 0:
        return Column(
          children: [
            GlassTextField(
              hint: 'Название заявки',
              controller: _titleController,
            ),
            const SizedBox(height: 16),
            GlassTextField(
              hint: 'Описание',
              controller: _descriptionController,
              maxLines: 5,
            ),
          ],
        );

      case 1:
        return Column(
          children: [
            GlassPanel(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(
                    Icons.add_photo_alternate_outlined,
                    size: 64,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.6)
                        : Colors.black.withValues(alpha: 0.6),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Нажмите чтобы добавить фото',
                    style: LiquidGlassTextStyles.bodySecondary(isDark),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ],
        );

      case 2:
        return Column(
          children: [
            'Алматы',
            'Астана',
            'Шымкент',
            'Караганда',
          ].map((region) {
            final isSelected = _selectedRegion == region;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: GestureDetector(
                onTap: () => setState(() => _selectedRegion = region),
                child: GlassPanel(
                  padding: const EdgeInsets.all(16),
                  borderRadius: 12,
                  color: isSelected
                      ? LiquidGlassColors.primaryOrange.withValues(alpha: 0.2)
                      : null,
                  borderColor: isSelected
                      ? LiquidGlassColors.primaryOrange
                      : null,
                  borderWidth: isSelected ? 2 : 1,
                  child: Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        color: isSelected
                            ? LiquidGlassColors.primaryOrange
                            : (isDark ? Colors.white : Colors.black),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        region,
                        style: LiquidGlassTextStyles.body.copyWith(
                          color: isSelected
                              ? LiquidGlassColors.primaryOrange
                              : (isDark ? Colors.white : Colors.black),
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        );

      default:
        return const SizedBox.shrink();
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }
}
