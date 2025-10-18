import 'package:flutter/material.dart';
import '../../data/models/order_model.dart';
import '../../data/repositories/order_repository.dart';

class OrderActionsWidget extends StatefulWidget {
  final OrderModel order;
  final String userRole; // 'user' or 'master'
  final OrderRepository repository;
  final VoidCallback onUpdate;

  const OrderActionsWidget({
    super.key,
    required this.order,
    required this.userRole,
    required this.repository,
    required this.onUpdate,
  });

  @override
  State<OrderActionsWidget> createState() => _OrderActionsWidgetState();
}

class _OrderActionsWidgetState extends State<OrderActionsWidget> {
  bool _loading = false;
  String? _error;
  String? _success;

  Future<void> _handleAction(
    Future<dynamic> Function() action,
    String successMsg,
  ) async {
    setState(() {
      _loading = true;
      _error = null;
      _success = null;
    });

    try {
      await action();
      setState(() => _success = successMsg);
      await Future.delayed(const Duration(seconds: 1));
      widget.onUpdate();
    } catch (e) {
      setState(() => _error = 'Ошибка: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (_error != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.red.shade200),
            ),
            child: Text(_error!, style: TextStyle(color: Colors.red.shade800)),
          ),
        ],

        if (_success != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.green.shade200),
            ),
            child: Text(_success!, style: TextStyle(color: Colors.green.shade800)),
          ),
        ],

        if (widget.userRole == 'user')
          ..._buildUserActions()
        else
          ..._buildMasterActions(),

        if (_loading) ...[
          const SizedBox(height: 16),
          const Center(
            child: Column(
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 8),
                Text('Обработка...', style: TextStyle(color: Colors.grey)),
              ],
            ),
          ),
        ],
      ],
    );
  }

  List<Widget> _buildUserActions() {
    if (widget.order.canBePaid) {
      return [
        ElevatedButton.icon(
          onPressed: _loading
              ? null
              : () => _handleAction(
                    () => widget.repository.payOrder(widget.order.id),
                    'Заказ оплачен! Средства в эскроу.',
                  ),
          icon: const Icon(Icons.payment),
          label: const Text('💳 Оплатить заказ'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: _loading
              ? null
              : () => _handleAction(
                    () => widget.repository.cancelOrder(widget.order.id),
                    'Заказ отменён',
                  ),
          icon: const Icon(Icons.close),
          label: const Text('✗ Отменить'),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
      ];
    }

    if (widget.order.status == 'paid') {
      return [
        ElevatedButton.icon(
          onPressed: _loading
              ? null
              : () => _handleAction(
                    () => widget.repository.cancelOrder(widget.order.id),
                    'Заказ отменён, средства возвращены',
                  ),
          icon: const Icon(Icons.close),
          label: const Text('✗ Отменить и вернуть деньги'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
      ];
    }

    if (widget.order.canBeApproved) {
      return [
        ElevatedButton.icon(
          onPressed: _loading
              ? null
              : () => _handleAction(
                    () => widget.repository.approveOrder(widget.order.id),
                    'Работа одобрена! Деньги переведены мастеру.',
                  ),
          icon: const Icon(Icons.check),
          label: const Text('✓ Одобрить и завершить'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
        const SizedBox(height: 8),
        ElevatedButton.icon(
          onPressed: _loading
              ? null
              : () => _handleAction(
                    () => widget.repository.openDispute(widget.order.id),
                    'Спор открыт. Администратор свяжется с вами.',
                  ),
          icon: const Icon(Icons.warning),
          label: const Text('⚠️ Открыть спор'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.orange,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
      ];
    }

    if (widget.order.canOpenDispute) {
      return [
        ElevatedButton.icon(
          onPressed: _loading
              ? null
              : () => _handleAction(
                    () => widget.repository.openDispute(widget.order.id),
                    'Спор открыт',
                  ),
          icon: const Icon(Icons.warning),
          label: const Text('⚠️ Открыть спор'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.orange,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
      ];
    }

    return [];
  }

  List<Widget> _buildMasterActions() {
    if (widget.order.canBeAccepted) {
      return [
        ElevatedButton.icon(
          onPressed: _loading
              ? null
              : () => _handleAction(
                    () => widget.repository.acceptOrder(widget.order.id),
                    'Заказ принят!',
                  ),
          icon: const Icon(Icons.check_circle),
          label: const Text('✓ Принять заказ'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
      ];
    }

    if (widget.order.canBeStarted) {
      return [
        ElevatedButton.icon(
          onPressed: _loading
              ? null
              : () => _handleAction(
                    () => widget.repository.startWork(widget.order.id),
                    'Работа начата!',
                  ),
          icon: const Icon(Icons.play_arrow),
          label: const Text('🚀 Начать работу'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.purple,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
      ];
    }

    if (widget.order.canBeCompleted) {
      return [
        ElevatedButton.icon(
          onPressed: _loading
              ? null
              : () => _handleAction(
                    () => widget.repository.completeOrder(widget.order.id),
                    'Работа завершена! Ожидайте проверки клиента.',
                  ),
          icon: const Icon(Icons.done_all),
          label: const Text('✓ Завершить работу'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
        const SizedBox(height: 8),
        ElevatedButton.icon(
          onPressed: _loading
              ? null
              : () => _handleAction(
                    () => widget.repository.openDispute(widget.order.id),
                    'Спор открыт',
                  ),
          icon: const Icon(Icons.warning),
          label: const Text('⚠️ Открыть спор'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.orange,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
      ];
    }

    return [];
  }
}

