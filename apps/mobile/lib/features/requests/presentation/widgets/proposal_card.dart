import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/request_model.dart';

class ProposalCard extends StatelessWidget {
  final ProposalModel proposal;
  final VoidCallback? onAccept;
  final VoidCallback? onReject;
  final bool canManage;
  final bool isLoading;

  const ProposalCard({
    super.key,
    required this.proposal,
    this.onAccept,
    this.onReject,
    this.canManage = true,
    this.isLoading = false,
  });

  String _getStatusLabel(String status) {
    switch (status) {
      case 'pending':
        return 'Ожидает ответа';
      case 'accepted':
        return 'Принято';
      case 'rejected':
        return 'Отклонено';
      case 'withdrawn':
        return 'Отозвано';
      default:
        return status;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'accepted':
        return Colors.green;
      case 'rejected':
      case 'withdrawn':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat('#,###', 'ru_RU');

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Price and status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${formatter.format(proposal.priceAsDouble)} ₸',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Срок: ${DateFormat('dd.MM.yyyy').format(proposal.deadline)}',
                      style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getStatusColor(proposal.status).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _getStatusLabel(proposal.status),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: _getStatusColor(proposal.status),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Description
            Text(
              proposal.description,
              style: TextStyle(fontSize: 14, color: Colors.grey.shade800),
            ),
            const SizedBox(height: 16),

            // Action buttons
            if (canManage && proposal.status == 'pending') ...[
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: isLoading ? null : onAccept,
                      icon: const Icon(Icons.check, size: 18),
                      label: Text(isLoading ? 'Обработка...' : 'Принять'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: isLoading ? null : onReject,
                      icon: const Icon(Icons.close, size: 18),
                      label: Text(isLoading ? 'Обработка...' : 'Отклонить'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],

            // Timestamp
            const SizedBox(height: 8),
            Text(
              'Предложено ${DateFormat('dd.MM.yyyy HH:mm').format(proposal.createdAt)}',
              style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
            ),
          ],
        ),
      ),
    );
  }
}

