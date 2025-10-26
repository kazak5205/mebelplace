import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';

class CreateOrderScreen extends ConsumerWidget {
  const CreateOrderScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Создать заказ'),
        backgroundColor: AppColors.primary,
      ),
      body: const Center(
        child: Text('Create Order Screen'),
      ),
    );
  }
}
