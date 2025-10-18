import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/order_model.dart';

class OrderListScreen extends StatelessWidget {
  final List<OrderModel> orders;
  final VoidCallback onRefresh;
  final bool isLoading;

  const OrderListScreen({
    super.key,
    required this.orders,
    required this.onRefresh,
    this.isLoading = false,
  });

  String _getStatusLabel(String status) {
    const labels = {
      'pending': 'Ожидает оплаты',
      'paid': 'Оплачен (эскроу)',
      'accepted': 'Принят мастером',
      'in_progress': 'В работе',
      'review': 'На проверке',
      'completed': 'Завершён',
      'cancelled': 'Отменён',
      'dispute': 'Спор',
    };
    return labels[status] ?? status;
  }

  Color _getStatusColor(String status) {
    const colors = {
      'pending': Colors.orange,
      'paid': Colors.blue,
      'accepted': Colors.green,
      'in_progress': Colors.purple,
      'review': Colors.orange,
      'completed': Colors.teal,
      'cancelled': Colors.grey,
      'dispute': Colors.red,
    };
    return colors[status] ?? Colors.grey;
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading && orders.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (orders.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.grey.shade300),
              const SizedBox(height: 16),
              Text(
                'У вас пока нет заказов',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey.shade700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Заказы создаются после\nпринятия предложения',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade500),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: orders.length,
        itemBuilder: (context, index) {
          final order = orders[index];
          final formatter = NumberFormat('#,###', 'ru_RU');

          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: InkWell(
              onTap: () {
                // Navigate to order details
                // Navigator.push(context, MaterialPageRoute(builder: (context) => OrderDetailScreen(orderId: order.id)));
              },
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${formatter.format(order.priceAsDouble)} ₸',
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Заказ #${order.id.substring(0, 8)}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _getStatusColor(order.status).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: _getStatusColor(order.status).withValues(alpha: 0.3),
                            ),
                          ),
                          child: Text(
                            _getStatusLabel(order.status),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: _getStatusColor(order.status),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Description
                    Text(
                      order.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 14, color: Colors.grey.shade800),
                    ),
                    const SizedBox(height: 12),

                    // Info
                    Wrap(
                      spacing: 12,
                      runSpacing: 8,
                      children: [
                        _buildInfoChip(
                          '⏰',
                          'До: ${DateFormat('dd.MM.yyyy').format(order.deadline)}',
                        ),
                        _buildInfoChip(
                          '📅',
                          DateFormat('dd.MM.yyyy').format(order.createdAt),
                        ),
                        if (order.completedAt != null)
                          _buildInfoChip(
                            '✅',
                            'Завершён: ${DateFormat('dd.MM').format(order.completedAt!)}',
                          ),
                      ],
                    ),

                    // Escrow indicator
                    if (order.isEscrowLocked) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue.shade200),
                        ),
                        child: Row(
                          children: [
                            const Text('🔒', style: TextStyle(fontSize: 18)),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Средства в эскроу (защищены)',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.blue.shade900,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoChip(String icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(icon, style: const TextStyle(fontSize: 14)),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
          ),
        ],
      ),
    );
  }
}

