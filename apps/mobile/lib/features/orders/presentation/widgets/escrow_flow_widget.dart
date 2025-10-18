import 'package:flutter/material.dart';
import '../../data/models/order_model.dart';

class EscrowFlowWidget extends StatelessWidget {
  final OrderModel order;

  const EscrowFlowWidget({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    if (order.status == 'cancelled') {
      return _buildCancelledState();
    }

    if (order.status == 'dispute') {
      return _buildDisputeState();
    }

    return _buildNormalFlow();
  }

  Widget _buildCancelledState() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300, width: 2),
      ),
      child: Column(
        children: [
          const Text('🚫', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          Text(
            'Заказ отменён',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Средства возвращены (если были в эскроу)',
            style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  Widget _buildDisputeState() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.orange.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.orange.shade300, width: 2),
      ),
      child: Column(
        children: [
          const Text('⚠️', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          Text(
            'Открыт спор',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.orange.shade900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Средства в эскроу. Администратор рассмотрит ситуацию.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: Colors.orange.shade700),
          ),
        ],
      ),
    );
  }

  Widget _buildNormalFlow() {
    final steps = [
      _StepData('pending', 'Создан', '📝'),
      _StepData('paid', 'Оплачен', '💰'),
      _StepData('accepted', 'Принят', '✓'),
      _StepData('in_progress', 'В работе', '🔨'),
      _StepData('review', 'Проверка', '👁️'),
      _StepData('completed', 'Завершён', '🎉'),
    ];

    final currentIndex = steps.indexWhere((s) => s.status == order.status);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.blue.shade50, Colors.purple.shade50],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Text('🔒', style: TextStyle(fontSize: 20)),
              SizedBox(width: 8),
              Text(
                'Escrow Flow - Защита сделки',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Steps
          for (var i = 0; i < steps.length; i++) ...[
            _buildStep(steps[i], i, currentIndex),
            if (i < steps.length - 1) _buildConnector(i < currentIndex),
          ],

          // Escrow info
          if (order.isEscrowLocked) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Row(
                children: [
                  const Text('🛡️', style: TextStyle(fontSize: 28)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Средства защищены',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${order.priceAsDouble.toStringAsFixed(0)} ₸ в эскроу до завершения',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStep(_StepData step, int index, int currentIndex) {
    final isCompleted = index < currentIndex;
    final isCurrent = index == currentIndex;
    final isFuture = index > currentIndex;

    return Row(
      children: [
        // Icon
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: isCompleted
                ? Colors.green
                : isCurrent
                    ? Colors.blue
                    : Colors.grey.shade300,
            shape: BoxShape.circle,
            boxShadow: isCurrent
                ? [
                    BoxShadow(
                      color: Colors.blue.withValues(alpha: 0.4),
                      blurRadius: 8,
                      spreadRadius: 2,
                    )
                  ]
                : [],
          ),
          child: Center(
            child: Text(
              isCompleted ? '✓' : step.icon,
              style: TextStyle(
                fontSize: 20,
                color: isCompleted || isCurrent ? Colors.white : Colors.grey.shade600,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),

        // Label
        Expanded(
          child: Text(
            step.label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
              color: isCompleted
                  ? Colors.green.shade700
                  : isCurrent
                      ? Colors.blue.shade700
                      : Colors.grey.shade600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildConnector(bool isCompleted) {
    return Container(
      margin: const EdgeInsets.only(left: 21, top: 4, bottom: 4),
      width: 2,
      height: 20,
      color: isCompleted ? Colors.green : Colors.grey.shade300,
    );
  }
}

class _StepData {
  final String status;
  final String label;
  final String icon;

  _StepData(this.status, this.label, this.icon);
}

