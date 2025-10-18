import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_button.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../../core/config/api_config.dart';

class PremiumPlansScreen extends ConsumerStatefulWidget {
  const PremiumPlansScreen({super.key});

  @override
  ConsumerState<PremiumPlansScreen> createState() => _PremiumPlansScreenState();
}

class _PremiumPlansScreenState extends ConsumerState<PremiumPlansScreen> {
  final _storage = const FlutterSecureStorage();
  List<PremiumPlan> _plans = [];
  String? _currentPlanId;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  Future<void> _loadPlans() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/subscriptions/plans'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _plans = (data['plans'] as List<dynamic>)
              .map((p) => PremiumPlan.fromJson(p))
              .toList();
          _currentPlanId = data['current_plan_id'] as String?;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _subscribeToPlan(String planId, double price) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/subscriptions/subscribe'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'plan_id': planId}),
      );

      if (response.statusCode == 200) {
        await _loadPlans();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Подписка оформлена!'),
              backgroundColor: LiquidGlassColors.success,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return Scaffold(
        backgroundColor: isDark ? Colors.black : Colors.white,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Premium подписки', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: _plans.map((plan) {
          final isCurrent = plan.id == _currentPlanId;
          
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: GlassPanel(
              padding: const EdgeInsets.all(24),
              borderColor: isCurrent ? LiquidGlassColors.primaryOrange : null,
              borderWidth: isCurrent ? 2 : 1,
              child: Column(
                children: [
                  if (isCurrent)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: LiquidGlassColors.primaryOrange,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'Текущий план',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  if (isCurrent) const SizedBox(height: 16),
                  
                  Text(
                    plan.name,
                    style: LiquidGlassTextStyles.h2Light(context),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '${plan.price}',
                        style: const TextStyle(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: LiquidGlassColors.primaryOrange,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '₸/${plan.period}',
                        style: LiquidGlassTextStyles.body.copyWith(
                          color: isDark ? Colors.white54 : Colors.black54,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  // Features
                  ...plan.features.map((feature) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.check_circle,
                            color: LiquidGlassColors.success,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(feature, style: LiquidGlassTextStyles.body),
                          ),
                        ],
                      ),
                    );
                  }),
                  
                  const SizedBox(height: 24),
                  
                  if (!isCurrent)
                    GlassButton.primary(
                      'Подписаться',
                      onTap: () => _subscribeToPlan(plan.id, plan.price),
                    ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class PremiumPlan {
  final String id;
  final String name;
  final double price;
  final String period; // month, year
  final List<String> features;

  PremiumPlan({
    required this.id,
    required this.name,
    required this.price,
    required this.period,
    required this.features,
  });

  factory PremiumPlan.fromJson(Map<String, dynamic> json) {
    return PremiumPlan(
      id: json['id'].toString(),
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      period: json['period'] as String,
      features: (json['features'] as List<dynamic>).map((f) => f as String).toList(),
    );
  }
}


