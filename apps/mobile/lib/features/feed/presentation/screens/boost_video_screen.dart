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

class BoostVideoScreen extends ConsumerStatefulWidget {
  final String videoId;
  final String videoTitle;

  const BoostVideoScreen({
    super.key,
    required this.videoId,
    required this.videoTitle,
  });

  @override
  ConsumerState<BoostVideoScreen> createState() => _BoostVideoScreenState();
}

class _BoostVideoScreenState extends ConsumerState<BoostVideoScreen> {
  final _storage = const FlutterSecureStorage();
  int _selectedDuration = 7; // days
  double _estimatedReach = 0;
  double _price = 0;
  bool _isLoading = false;

  final Map<int, Map<String, dynamic>> _durations = {
    3: {'price': 5000, 'reach': '5K-10K'},
    7: {'price': 10000, 'reach': '15K-25K'},
    14: {'price': 18000, 'reach': '30K-50K'},
    30: {'price': 35000, 'reach': '70K-100K'},
  };

  @override
  void initState() {
    super.initState();
    _updatePrice();
  }

  void _updatePrice() {
    final data = _durations[_selectedDuration]!;
    setState(() {
      _price = (data['price'] as int).toDouble();
      _estimatedReach = _price;
    });
  }

  Future<void> _startBoost() async {
    setState(() => _isLoading = true);

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) throw Exception('Not authenticated');

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/videos/${widget.videoId}/boost'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'duration_days': _selectedDuration,
          'budget': _price,
        }),
      );

      if (response.statusCode == 200) {
        if (mounted) {
          Navigator.pop(context, true);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Продвижение запущено!'),
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
        title: Text('Продвижение видео', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Video info
          GlassPanel(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Icon(Icons.video_library, size: 48, color: LiquidGlassColors.primaryOrange),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    widget.videoTitle,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          Text(
            'Выберите длительность',
            style: LiquidGlassTextStyles.h3Light(isDark),
          ),
          const SizedBox(height: 16),
          
          // Duration options
          ..._durations.entries.map((entry) {
            final days = entry.key;
            final data = entry.value;
            final isSelected = _selectedDuration == days;
            
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: GestureDetector(
                onTap: () {
                  setState(() => _selectedDuration = days);
                  _updatePrice();
                },
                child: GlassPanel(
                  padding: const EdgeInsets.all(20),
                  borderColor: isSelected ? LiquidGlassColors.primaryOrange : null,
                  borderWidth: isSelected ? 2 : 1,
                  child: Row(
                    children: [
                      Icon(
                        isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                        color: LiquidGlassColors.primaryOrange,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '$days дней',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Охват: ${data['reach']}',
                              style: LiquidGlassTextStyles.caption.copyWith(
                                color: isDark ? Colors.white54 : Colors.black54,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '${data['price']} ₸',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: LiquidGlassColors.primaryOrange,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),
          
          const SizedBox(height: 24),
          
          // Summary
          GlassPanel(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Длительность:', style: LiquidGlassTextStyles.body),
                    Text(
                      '$_selectedDuration дней',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Ожидаемый охват:', style: LiquidGlassTextStyles.body),
                    Text(
                      _durations[_selectedDuration]!['reach'] as String,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const Divider(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Итого:',
                      style: LiquidGlassTextStyles.h3Light(isDark),
                    ),
                    Text(
                      '$_price ₸',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: LiquidGlassColors.primaryOrange,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          GlassButton.primary(
            'Оплатить и запустить',
            isLoading: _isLoading,
            onTap: _startBoost,
          ),
        ],
      ),
    );
  }
}

class PremiumPlan {
  final String id;
  final String name;
  final double price;
  final String period;
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


