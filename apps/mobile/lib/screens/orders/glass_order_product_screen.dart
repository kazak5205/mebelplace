import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassOrderProductScreen extends ConsumerStatefulWidget {
  final String productId;
  final String productName;
  final double productPrice;

  const GlassOrderProductScreen({
    super.key,
    required this.productId,
    required this.productName,
    required this.productPrice,
  });

  @override
  ConsumerState<GlassOrderProductScreen> createState() => _GlassOrderProductScreenState();
}

class _GlassOrderProductScreenState extends ConsumerState<GlassOrderProductScreen> {
  final _quantityController = TextEditingController(text: '1');
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Оформить заказ', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassPanel(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.productName, style: LiquidGlassTextStyles.h2Light(context)),
                const SizedBox(height: 8),
                Text('${widget.productPrice} ₸', style: LiquidGlassTextStyles.h3.copyWith(color: LiquidGlassColors.primaryOrange)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassTextField(hint: 'Количество', controller: _quantityController, keyboardType: TextInputType.number),
          const SizedBox(height: 16),
          GlassTextField(hint: 'Адрес доставки', controller: _addressController, maxLines: 2),
          const SizedBox(height: 16),
          GlassTextField(hint: 'Комментарий', controller: _notesController, maxLines: 3),
          const SizedBox(height: 24),
          GlassButton.primary('Заказать', onTap: () {
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Заказ оформлен!'), backgroundColor: LiquidGlassColors.success),
            );
          }),
        ],
      ),
    );
  }
}

