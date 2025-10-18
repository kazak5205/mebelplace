import 'package:flutter/material.dart';
import '../../core/config/api_config_export.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/config/api_config_export.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/config/api_config_export.dart';
import 'package:http/http.dart' as http;
import '../../core/config/api_config_export.dart';
import 'dart:convert';
import '../../core/config/api_config_export.dart';
import 'dart:async';
import '../../core/config/api_config_export.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/config/api_config_export.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/config/api_config_export.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../core/config/api_config_export.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../core/config/api_config_export.dart';

class GlassVerifyEmailScreen extends ConsumerStatefulWidget {
  final String email;

  const GlassVerifyEmailScreen({super.key, required this.email});

  @override
  ConsumerState<GlassVerifyEmailScreen> createState() => _GlassVerifyEmailScreenState();
}

class _GlassVerifyEmailScreenState extends ConsumerState<GlassVerifyEmailScreen> {
  final _codeController = TextEditingController();
  final _storage = const FlutterSecureStorage();
  bool _isLoading = false;
  bool _isResending = false;
  int _resendTimer = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  void dispose() {
    _codeController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    setState(() => _resendTimer = 60);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendTimer > 0) {
        setState(() => _resendTimer--);
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _verifyCode() async {
    if (_codeController.text.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Введите 6-значный код')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final token = await _storage.read(key: 'auth_token');
      
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/auth/verify-email'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'email': widget.email,
          'code': _codeController.text,
        }),
      );

      if (response.statusCode == 200) {
        if (mounted) {
          Navigator.pop(context, true);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Email подтверждён!'),
              backgroundColor: LiquidGlassColors.success,
            ),
          );
        }
      } else {
        throw Exception('Неверный код');
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

  Future<void> _resendCode() async {
    if (_resendTimer > 0) return;

    setState(() => _isResending = true);

    try {
      final token = await _storage.read(key: 'auth_token');
      
      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/auth/verify-email/resend'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode({'email': widget.email}),
      );

      _startResendTimer();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Код отправлен повторно')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isResending = false);
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
        title: Text('Подтверждение Email', style: LiquidGlassTextStyles.h3Light(isDark)),
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
                    Icons.email,
                    size: 64,
                    color: LiquidGlassColors.primaryOrange,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Проверьте почту',
                    style: LiquidGlassTextStyles.h2Light(context),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Мы отправили 6-значный код на\n${widget.email}',
                    style: LiquidGlassTextStyles.body.copyWith(
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  
                  // OTP Input (6 digits)
                  TextField(
                    controller: _codeController,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 6,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 16,
                    ),
                    decoration: InputDecoration(
                      hintText: '000000',
                      counterText: '',
                      filled: true,
                      fillColor: isDark 
                          ? Colors.white.withValues(alpha: 0.05)
                          : Colors.black.withValues(alpha: 0.03),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  GlassButton.primary(
                    'Подтвердить',
                    isLoading: _isLoading,
                    onTap: _verifyCode,
                  ),
                  const SizedBox(height: 16),
                  
                  // Resend code
                  TextButton(
                    onPressed: _resendTimer == 0 && !_isResending ? _resendCode : null,
                    child: Text(
                      _resendTimer > 0
                          ? 'Отправить повторно через $_resendTimer сек'
                          : 'Отправить код повторно',
                      style: TextStyle(
                        color: _resendTimer > 0
                            ? (isDark ? Colors.white38 : Colors.black38)
                            : LiquidGlassColors.primaryOrange,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}


