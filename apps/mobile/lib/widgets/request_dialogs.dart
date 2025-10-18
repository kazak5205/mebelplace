import 'package:flutter/material.dart';
import '../models/request.dart';
import '../../core/theme/app_theme.dart';

class RequestDetailsDialog extends StatelessWidget {
  final Request request;

  const RequestDetailsDialog({
    super.key,
    required this.request,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        constraints: const BoxConstraints(maxHeight: 600),
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
                  const Icon(Icons.assignment, color: Colors.white),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      request.title,
                      style: const TextStyle(
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
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Status
                    Row(
                      children: [
                        const Text('Статус:', style: AppTheme.body2),
                        const SizedBox(width: 8),
                        _buildStatusChip(request.status),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    // Description
                    const Text('Описание:', style: AppTheme.body2),
                    const SizedBox(height: 8),
                    Text(request.description, style: AppTheme.body1),
                    const SizedBox(height: 16),
                    
                    // Details
                    _buildDetailRow('Регион', request.regionName),
                    if (request.budget != null)
                      _buildDetailRow('Бюджет', '${request.budget} ₽'),
                    _buildDetailRow('Создано', _formatDate(request.createdAt)),
                    
                    // Photos
                    if (request.photos != null && request.photos!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text('Фотографии:', style: AppTheme.body2),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 100,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: request.photos!.length,
                          itemBuilder: (context, index) {
                            final photo = request.photos![index];
                            return Container(
                              margin: const EdgeInsets.only(right: 8),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  photo,
                                  width: 100,
                                  height: 100,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      width: 100,
                                      height: 100,
                                      color: Colors.black,
                                      child: const Icon(Icons.error),
                                    );
                                  },
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                    
                    // Responses
                    if (request.responses != null && request.responses!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text('Предложения мастеров:', style: AppTheme.body2),
                      const SizedBox(height: 8),
                      ...request.responses!.map((response) => _buildResponseCard(response)),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text('$label:', style: AppTheme.body2),
          ),
          Expanded(child: Text(value, style: AppTheme.body1)),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    String label;
    
    switch (status) {
      case 'pending':
        color = Colors.orange;
        label = 'Ожидает';
        break;
      case 'in_progress':
        color = Colors.blue;
        label = 'В работе';
        break;
      case 'completed':
        color = Colors.green;
        label = 'Выполнено';
        break;
      case 'cancelled':
        color = Colors.red;
        label = 'Отменено';
        break;
      default:
        color = Colors.grey;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildResponseCard(RequestResponse response) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (response.price != null) ...[
                Text(
                  '${response.price} ₽',
                  style: AppTheme.body2.copyWith(
                    fontWeight: FontWeight.w600,
                    color: Colors.blue,
                  ),
                ),
                const SizedBox(width: 8),
              ],
              const Spacer(),
              Text(
                _formatDate(response.createdAt),
                style: AppTheme.caption,
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(response.message, style: AppTheme.body2),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}.${date.month}.${date.year}';
  }
}

class RequestActionsBottomSheet extends StatelessWidget {
  final Request request;

  const RequestActionsBottomSheet({
    super.key,
    required this.request,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Действия с заявкой',
            style: AppTheme.headline4,
          ),
          const SizedBox(height: 16),
          
          if (request.status == 'in_progress') ...[
            _buildActionTile(
              context,
              icon: Icons.check_circle,
              title: 'Сдать работу',
              subtitle: 'Отметить заявку как выполненную',
              onTap: () => _completeRequest(context),
            ),
            _buildActionTile(
              context,
              icon: Icons.cancel,
              title: 'Отменить',
              subtitle: 'Отменить выполнение заявки',
              onTap: () => _cancelRequest(context),
            ),
            _buildActionTile(
              context,
              icon: Icons.refresh,
              title: 'На доработку',
              subtitle: 'Вернуть заявку на доработку',
              onTap: () => _reworkRequest(context),
            ),
          ],
          
          _buildActionTile(
            context,
            icon: Icons.message,
            title: 'Написать мастеру',
            subtitle: 'Отправить сообщение',
            onTap: () => _messageMaster(context),
          ),
          
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Закрыть'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.blue),
      title: Text(title),
      subtitle: Text(subtitle),
      onTap: onTap,
    );
  }

  void _completeRequest(BuildContext context) {
    Navigator.of(context).pop();
    // Mark request as completed
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Заявка отмечена как выполненная')),
    );
  }

  void _cancelRequest(BuildContext context) {
    Navigator.of(context).pop();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Отменить заявку?'),
        content: const Text('Вы уверены, что хотите отменить эту заявку?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Нет'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              // Cancel request
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Заявка отменена')),
              );
            },
            child: const Text('Да'),
          ),
        ],
      ),
    );
  }

  void _reworkRequest(BuildContext context) {
    Navigator.of(context).pop();
    // Send request for rework
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Заявка отправлена на доработку')),
    );
  }

  void _messageMaster(BuildContext context) {
    Navigator.of(context).pop();
    // Navigate to messages
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Переход к сообщениям')),
    );
  }
}

class AllResponsesDialog extends StatelessWidget {
  final Request request;

  const AllResponsesDialog({
    super.key,
    required this.request,
  });

  @override
  Widget build(BuildContext context) {
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
                  const Icon(Icons.message, color: Colors.white),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Предложения мастеров (${request.responses!.length})',
                      style: const TextStyle(
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
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: request.responses!.length,
                itemBuilder: (context, index) {
                  final response = request.responses![index];
                  return _buildResponseCard(response);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResponseCard(RequestResponse response) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (response.price != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${response.price} ₽',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],
              const Spacer(),
              Text(
                _formatDate(response.createdAt),
                style: AppTheme.caption,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(response.message, style: AppTheme.body1),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    debugPrint('Contact master: ${response.masterId}');
                  },
                  child: const Text('Связаться'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    debugPrint('Accept offer');
                  },
                  child: const Text('Принять'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}.${date.month}.${date.year}';
  }

  void _contactMaster(BuildContext context, RequestResponse response) {
    // Navigate to messages with master
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Переход к сообщениям с мастером')),
    );
  }

  void _acceptOffer(BuildContext context) {
    // Accept offer
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Предложение принято')),
    );
  }
}

