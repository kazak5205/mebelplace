import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_button.dart';
import '../../../../core/widgets/glass/glass_text_field.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../../core/config/api_config.dart';

class CreateReviewScreen extends ConsumerStatefulWidget {
  final String orderId;
  final String masterId;
  final String masterName;

  const CreateReviewScreen({
    super.key,
    required this.orderId,
    required this.masterId,
    required this.masterName,
  });

  @override
  ConsumerState<CreateReviewScreen> createState() => _CreateReviewScreenState();
}

class _CreateReviewScreenState extends ConsumerState<CreateReviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _textController = TextEditingController();
  final _storage = const FlutterSecureStorage();
  int _rating = 5;
  bool _isLoading = false;

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) throw Exception('Not authenticated');

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/orders/${widget.orderId}/review'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'master_id': widget.masterId,
          'rating': _rating,
          'comment': _textController.text,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (mounted) {
          Navigator.pop(context, true);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Отзыв опубликован!'),
              backgroundColor: LiquidGlassColors.success,
            ),
          );
        }
      } else {
        throw Exception('Failed to submit review');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка: $e'),
            backgroundColor: LiquidGlassColors.errorRed,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Оставить отзыв', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            GlassPanel(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Text(
                    'Оцените работу мастера',
                    style: LiquidGlassTextStyles.h3Light(isDark),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.masterName,
                    style: LiquidGlassTextStyles.body.copyWith(
                      color: LiquidGlassColors.primaryOrange,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Star rating
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      return IconButton(
                        iconSize: 48,
                        onPressed: () => setState(() => _rating = index + 1),
                        icon: Icon(
                          index < _rating ? Icons.star : Icons.star_border,
                          color: LiquidGlassColors.primaryOrange,
                        ),
                      );
                    }),
                  ),
                  
                  Text(
                    _rating == 5 ? 'Отлично!' :
                    _rating == 4 ? 'Хорошо' :
                    _rating == 3 ? 'Нормально' :
                    _rating == 2 ? 'Плохо' : 'Ужасно',
                    style: LiquidGlassTextStyles.body.copyWith(
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Comment
            GlassPanel(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Комментарий (необязательно)',
                    style: LiquidGlassTextStyles.body.copyWith(
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GlassTextField(
                    hint: 'Расскажите о работе мастера...',
                    controller: _textController,
                    maxLines: 5,
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            GlassButton.primary(
              'Опубликовать отзыв',
              isLoading: _isLoading,
              onTap: _submitReview,
            ),
          ],
        ),
      ),
    );
  }
}


