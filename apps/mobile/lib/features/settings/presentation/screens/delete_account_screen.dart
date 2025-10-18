import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_button.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider_export.dart';
import '../../../../core/config/api_config.dart';

class DeleteAccountScreen extends ConsumerStatefulWidget {
  const DeleteAccountScreen({super.key});

  @override
  ConsumerState<DeleteAccountScreen> createState() => _DeleteAccountScreenState();
}

class _DeleteAccountScreenState extends ConsumerState<DeleteAccountScreen> {
  final _passwordController = TextEditingController();
  final _storage = const FlutterSecureStorage();
  bool _isLoading = false;
  bool _confirmChecked = false;

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _deleteAccount() async {
    if (!_confirmChecked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Подтвердите удаление аккаунта')),
      );
      return;
    }

    if (_passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Введите пароль')),
      );
      return;
    }

    // Final confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Удалить аккаунт?'),
        content: const Text(
          'Это действие необратимо!\n\n'
          'Будут удалены:\n'
          '• Все ваши видео\n'
          '• Все сообщения\n'
          '• История заказов\n'
          '• Профиль и данные',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('УДАЛИТЬ'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isLoading = true);

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) throw Exception('Not authenticated');

      final response = await http.delete(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/settings/delete-account'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: _passwordController.text,
      );

      if (response.statusCode == 200) {
        // Logout and clear data
        await _storage.deleteAll();
        ref.read(authProvider.notifier).logout();
        
        if (mounted) {
          Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Аккаунт удалён'),
              backgroundColor: LiquidGlassColors.success,
            ),
          );
        }
      } else {
        throw Exception('Неверный пароль или ошибка сервера');
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
        title: Text('Удалить аккаунт', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            GlassPanel(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    size: 80,
                    color: LiquidGlassColors.errorRed,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Внимание!',
                    style: LiquidGlassTextStyles.h2Light(context).copyWith(
                      color: LiquidGlassColors.errorRed,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Удаление аккаунта необратимо. Все ваши данные будут безвозвратно удалены:',
                    style: LiquidGlassTextStyles.body.copyWith(
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  
                  // Warning list
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: LiquidGlassColors.errorRed.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildWarningItem('Все видео и контент'),
                        _buildWarningItem('История сообщений'),
                        _buildWarningItem('Заказы и транзакции'),
                        _buildWarningItem('Баланс кошелька'),
                        _buildWarningItem('Достижения и уровень'),
                        _buildWarningItem('Подписки и подписчики'),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Password confirmation
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Введите пароль для подтверждения',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.lock),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Confirmation checkbox
                  CheckboxListTile(
                    value: _confirmChecked,
                    onChanged: (value) => setState(() => _confirmChecked = value ?? false),
                    title: const Text('Я понимаю, что это действие необратимо'),
                    activeColor: LiquidGlassColors.errorRed,
                    contentPadding: EdgeInsets.zero,
                  ),
                  
                  const SizedBox(height: 24),
                  
                  GlassButton(
                    text: 'Удалить аккаунт навсегда',
                    onTap: _deleteAccount,
                    isPrimary: false,
                    isLoading: _isLoading,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWarningItem(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          const Icon(
            Icons.close,
            size: 16,
            color: LiquidGlassColors.errorRed,
          ),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(fontSize: 14)),
        ],
      ),
    );
  }
}


