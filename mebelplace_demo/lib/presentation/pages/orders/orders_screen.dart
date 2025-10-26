import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Заказы'),
        backgroundColor: AppColors.primary,
      ),
      body: const Center(
        child: Text('Orders Screen'),
      ),
    );
  }
}
