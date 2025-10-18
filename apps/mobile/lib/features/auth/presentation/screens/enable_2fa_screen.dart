import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:qr_flutter/qr_flutter.dart';
import 'dart:convert';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_button.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../../core/config/api_config.dart';

class Enable2FAScreen extends ConsumerStatefulWidget {
  const Enable2FAScreen({super.key});

  @override
  ConsumerState<Enable2FAScreen> createState() => _Enable2FAScreenState();
}

class _Enable2FAScreenState extends ConsumerState<Enable2FAScreen> {
  final _storage = const FlutterSecureStorage();
  final _codeController = TextEditingController();
  
  bool _isLoading = true;
  String? _qrData;
  String? _secret;

  @override
  void initState() {
    super.initState();
    _init2FA();
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _init2FA() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/auth/2fa/init'),
        headers: {'Authorization': 'Bearer ${token ?? ''}'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _qrData = data['qr_url'];
          _secret = data['secret'];
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e')),
        );
      }
    }
  }

  Future<void> _verify2FA() async {
    if (_codeController.text.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Введите 6-значный код')),
      );
      return;
    }

    try {
      final token = await _storage.read(key: 'auth_token');
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/auth/2fa/verify'),
        headers: {
          'Authorization': 'Bearer ${token ?? ''}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'code': _codeController.text,
          'secret': _secret,
        }),
      );

      if (response.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('2FA успешно включена'),
            backgroundColor: LiquidGlassColors.success,
          ),
        );
        Navigator.pop(context, true);
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
        title: Text(
          'Двухфакторная аутентификация',
          style: TextStyle(color: isDark ? Colors.white : Colors.black),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  GlassPanel(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Text(
                          'Отсканируйте QR код в приложении Google Authenticator',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            color: isDark ? Colors.white : Colors.black,
                          ),
                        ),
                        const SizedBox(height: 24),
                        
                        if (_qrData != null)
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: QrImageView(
                              data: _qrData!,
                              version: QrVersions.auto,
                              size: 200.0,
                              backgroundColor: Colors.white,
                            ),
                          )
                        else
                          Container(
                            width: 200,
                            height: 200,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Center(child: CircularProgressIndicator()),
                          ),
                        
                        const SizedBox(height: 24),
                        if (_secret != null) ...[
                          Text(
                            'Или введите ключ вручную:',
                            style: TextStyle(color: isDark ? Colors.white : Colors.black),
                          ),
                          const SizedBox(height: 8),
                          SelectableText(
                            _secret!,
                            style: TextStyle(
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : Colors.black,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  GlassPanel(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Text(
                          'Введите 6-значный код из приложения',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: isDark ? Colors.white : Colors.black),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _codeController,
                          keyboardType: TextInputType.number,
                          maxLength: 6,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 24,
                            letterSpacing: 8,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : Colors.black,
                          ),
                          decoration: InputDecoration(
                            hintText: '000000',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            contentPadding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _verify2FA,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: LiquidGlassColors.primaryOrange,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: const Text('Подтвердить'),
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
