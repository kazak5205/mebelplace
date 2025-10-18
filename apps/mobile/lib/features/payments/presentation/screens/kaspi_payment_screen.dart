import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../../core/config/api_config.dart';

class KaspiPaymentScreen extends ConsumerStatefulWidget {
  final String orderId;
  final double amount;

  const KaspiPaymentScreen({
    super.key,
    required this.orderId,
    required this.amount,
  });

  @override
  ConsumerState<KaspiPaymentScreen> createState() => _KaspiPaymentScreenState();
}

class _KaspiPaymentScreenState extends ConsumerState<KaspiPaymentScreen> {
  final _storage = const FlutterSecureStorage();
  late WebViewController _controller;
  bool _isLoading = true;
  String? _paymentUrl;

  @override
  void initState() {
    super.initState();
    _initializePayment();
  }

  Future<void> _initializePayment() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) throw Exception('Not authenticated');

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/payments/kaspi/init'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'order_id': widget.orderId,
          'amount': widget.amount,
          'callback_url': '${ApiConfig.baseUrl}/payments/callback/kaspi',
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _paymentUrl = data['payment_url'];
          _isLoading = false;
        });
        
        _controller = WebViewController()
          ..setJavaScriptMode(JavaScriptMode.unrestricted)
          ..setNavigationDelegate(
            NavigationDelegate(
              onPageFinished: (url) {
                setState(() => _isLoading = false);
              },
              onNavigationRequest: (request) {
                if (request.url.contains('/payment/success')) {
                  Navigator.pop(context, true);
                  return NavigationDecision.prevent;
                }
                if (request.url.contains('/payment/cancel')) {
                  Navigator.pop(context, false);
                  return NavigationDecision.prevent;
                }
                return NavigationDecision.navigate;
              },
            ),
          )
          ..loadRequest(Uri.parse(_paymentUrl!));
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка инициализации: $e')),
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
        title: const Text('Оплата Kaspi'),
      ),
      body: Stack(
        children: [
          if (_paymentUrl != null)
            WebViewWidget(controller: _controller),
          if (_isLoading)
            Container(
              color: Colors.black.withValues(alpha: 0.7),
              child: const Center(
                child: CircularProgressIndicator(
                  color: LiquidGlassColors.primaryOrange,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
