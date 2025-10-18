import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/video.dart';
import '../models/order.dart';
// TODO: Update import for providers
import '../../core/theme/app_theme.dart';

class OrderDialog extends ConsumerStatefulWidget {
  final Video video;

  const OrderDialog({
    super.key,
    required this.video,
  });

  @override
  ConsumerState<OrderDialog> createState() => _OrderDialogState();
}

class _OrderDialogState extends ConsumerState<OrderDialog> {
  final TextEditingController _commentController = TextEditingController();
  final TextEditingController _productNameController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _commentController.dispose();
    _productNameController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final orderState = ref.watch(orderProvider);

    return Dialog(
      child: Container(
        constraints: const BoxConstraints(maxHeight: 500),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.blue,
                borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.shopping_cart, color: Colors.white),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Заказ товара',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Video info
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  widget.video.thumbnailUrl ?? '',
                                  width: 60,
                                  height: 45,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      width: 60,
                                      height: 45,
                                      color: Colors.grey[300],
                                      child: const Icon(Icons.video_library),
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      widget.video.title,
                                      style: AppTheme.headline3,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Автор: ${widget.video.author.name}',
                                      style: AppTheme.body2,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Product name
                      TextFormField(
                        initialValue: widget.video.title,
                        decoration: const InputDecoration(
                          labelText: 'Название товара',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Введите название товара';
                          }
                          return null;
                        },
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Price
                      TextFormField(
                        initialValue: widget.video.productPrice?.toString() ?? '',
                        decoration: const InputDecoration(
                          labelText: 'Цена (₽)',
                          border: OutlineInputBorder(),
                          prefixText: '₽ ',
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Введите цену';
                          }
                          final price = double.tryParse(value);
                          if (price == null || price <= 0) {
                            return 'Введите корректную цену';
                          }
                          return null;
                        },
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Comment
                      TextFormField(
                        controller: _commentController,
                        decoration: const InputDecoration(
                          labelText: 'Комментарий к заказу',
                          border: OutlineInputBorder(),
                          hintText: 'Дополнительные пожелания...',
                        ),
                        maxLines: 3,
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Error message
                      if (orderState is OrderError)
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.red[200]!),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.error, color: Colors.red[600]),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  (orderState as OrderError).message,
                                  style: TextStyle(color: Colors.red[600]),
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
            
            // Actions
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(8)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Отмена'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: orderState is OrderCreating ? null : _createOrder,
                      child: orderState is OrderCreating
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Заказать'),
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

  void _createOrder() {
    if (!_formKey.currentState!.validate()) return;

    final productName = _productNameController.text.trim();
    final price = double.tryParse(_priceController.text) ?? 0.0;
    final comment = _commentController.text.trim();

    ref.read(orderProvider.notifier).createOrder(
      CreateOrderRequest(
        videoId: int.tryParse(widget.video.id) ?? 0,
        masterId: int.tryParse(widget.video.author.id) ?? 0,
        productName: productName,
        price: price,
        comment: comment.isEmpty ? null : comment,
      ),
    ).then((_) {
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Заказ успешно создан!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }).catchError((error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка создания заказа: $error'),
            backgroundColor: Colors.red,
          ),
        );
      }
    });
  }
}
