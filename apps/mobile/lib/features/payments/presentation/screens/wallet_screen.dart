import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/payment_model.dart';

class WalletScreen extends StatelessWidget {
  final WalletModel wallet;
  final List<TransactionModel> transactions;
  final VoidCallback onRefresh;
  final VoidCallback onDeposit;
  final VoidCallback onWithdraw;

  const WalletScreen({
    super.key,
    required this.wallet,
    required this.transactions,
    required this.onRefresh,
    required this.onDeposit,
    required this.onWithdraw,
  });

  String _getTransactionLabel(String type) {
    const labels = {
      'deposit': 'Пополнение',
      'withdraw': 'Вывод средств',
      'escrow_lock': 'Эскроу (блокировка)',
      'escrow_release': 'Эскроу (выплата)',
      'escrow_refund': 'Эскроу (возврат)',
    };
    return labels[type] ?? type;
  }

  String _getTransactionIcon(String type) {
    const icons = {
      'deposit': '💰',
      'withdraw': '📤',
      'escrow_lock': '🔒',
      'escrow_release': '✅',
      'escrow_refund': '↩️',
    };
    return icons[type] ?? '💵';
  }

  Color _getTransactionColor(String type) {
    const colors = {
      'deposit': Colors.green,
      'withdraw': Colors.red,
      'escrow_lock': Colors.blue,
      'escrow_release': Colors.green,
      'escrow_refund': Colors.orange,
    };
    return colors[type] ?? Colors.grey;
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat('#,###', 'ru_RU');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Мой кошелёк'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: onRefresh,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => onRefresh(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Wallet card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF667eea), Color(0xFF764ba2)],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.purple.withValues(alpha: 0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Доступный баланс',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${formatter.format(wallet.balanceAsDouble)} ₸',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const Text('👛', style: TextStyle(fontSize: 48)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.only(top: 16),
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Colors.white24, width: 1),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'В эскроу',
                              style: TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${formatter.format(wallet.escrowBalanceAsDouble)} ₸',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text(
                              'Всего',
                              style: TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${formatter.format(wallet.totalBalance)} ₸',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onDeposit,
                    icon: const Icon(Icons.add),
                    label: const Text('Пополнить'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onWithdraw,
                    icon: const Icon(Icons.arrow_downward),
                    label: const Text('Вывести'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Transaction history
            Text(
              'История транзакций',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),

            if (transactions.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: Text(
                    'Нет транзакций',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              )
            else
              ...transactions.map((tx) {
                final isIncoming = ['deposit', 'escrow_release', 'escrow_refund'].contains(tx.type);
                
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        // Icon
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: _getTransactionColor(tx.type).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              _getTransactionIcon(tx.type),
                              style: const TextStyle(fontSize: 24),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),

                        // Info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _getTransactionLabel(tx.type),
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                DateFormat('dd.MM.yyyy HH:mm').format(tx.createdAt),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Amount
                        Text(
                          '${isIncoming ? '+' : '-'}${formatter.format(tx.amountAsDouble)} ₸',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: _getTransactionColor(tx.type),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
          ],
        ),
      ),
    );
  }
}

