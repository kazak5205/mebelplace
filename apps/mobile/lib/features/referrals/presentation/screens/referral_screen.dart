import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:share_plus/share_plus.dart';
import 'dart:convert';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_button.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../../core/config/api_config.dart';

class ReferralScreen extends ConsumerStatefulWidget {
  const ReferralScreen({super.key});

  @override
  ConsumerState<ReferralScreen> createState() => _ReferralScreenState();
}

class _ReferralScreenState extends ConsumerState<ReferralScreen> {
  final _storage = const FlutterSecureStorage();
  
  String? _referralCode;
  int _referralsCount = 0;
  List<Map<String, dynamic>> _referrals = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReferralData();
  }

  Future<void> _loadReferralData() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/referrals/my-code'),
        headers: {'Authorization': 'Bearer ${token ?? ''}'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _referralCode = data['code'];
          _referralsCount = data['referrals_count'] ?? 0;
          _referrals = (data['referrals'] as List?)?.cast<Map<String, dynamic>>() ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _shareReferralLink() {
    if (_referralCode == null) return;
    
    final link = '${ApiConfig.webUrl}/register?ref=$_referralCode';
    Share.share(
      'Присоединяйся к MebelPlace! Используй мой код: $_referralCode\n$link',
    );
  }

  void _copyReferralCode() {
    if (_referralCode == null) return;
    
    Clipboard.setData(ClipboardData(text: _referralCode!));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Код скопирован')),
    );
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
          'Реферальная программа',
          style: TextStyle(color: isDark ? Colors.white : Colors.black),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  GlassPanel(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        const Icon(
                          Icons.card_giftcard,
                          size: 64,
                          color: LiquidGlassColors.primaryOrange,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Ваш реферальный код',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white : Colors.black,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: LiquidGlassColors.primaryOrange.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: LiquidGlassColors.primaryOrange,
                              width: 2,
                            ),
                          ),
                          child: Text(
                            _referralCode ?? 'LOADING...',
                            style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 4,
                              color: LiquidGlassColors.primaryOrange,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: _copyReferralCode,
                                icon: const Icon(Icons.copy),
                                label: const Text('Копировать'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: LiquidGlassColors.primaryOrange,
                                  side: const BorderSide(color: LiquidGlassColors.primaryOrange),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: _shareReferralLink,
                                icon: const Icon(Icons.share),
                                label: const Text('Поделиться'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: LiquidGlassColors.primaryOrange,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  GlassPanel(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Ваши рефералы: $_referralsCount',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white : Colors.black,
                          ),
                        ),
                        if (_referrals.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          ..._referrals.take(5).map((ref) => ListTile(
                                leading: const CircleAvatar(
                                  child: Icon(Icons.person),
                                ),
                                title: Text(
                                  ref['name'] ?? 'User',
                                  style: TextStyle(color: isDark ? Colors.white : Colors.black),
                                ),
                                subtitle: Text(
                                  ref['joined_at'] ?? '',
                                  style: TextStyle(color: isDark ? Colors.white70 : Colors.black54),
                                ),
                              )),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
