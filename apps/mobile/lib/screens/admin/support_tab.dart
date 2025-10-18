import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';

// Таб поддержки в админ-панели
class SupportTab extends ConsumerStatefulWidget {
  const SupportTab({super.key});

  @override
  ConsumerState<SupportTab> createState() => _SupportTabState();
}

class _SupportTabState extends ConsumerState<SupportTab> {
  final TextEditingController _replyController = TextEditingController();
  bool _isLoading = false;

  // Support tickets data
  final List<Map<String, dynamic>> _supportTickets = [
    {
      'id': 1,
      'user_name': 'Иван Петров',
      'user_email': 'ivan@example.com',
      'subject': 'Проблема с загрузкой видео',
      'message': 'Не могу загрузить видео в приложение. Постоянно выдает ошибку.',
      'status': 'open',
      'priority': 'high',
      'created_at': '2025-10-02 14:30',
      'replies': [],
    },
    {
      'id': 2,
      'user_name': 'Анна Сидорова',
      'user_email': 'anna@example.com',
      'subject': 'Вопрос по оплате',
      'message': 'Как настроить оплату для заказов? Не нашла эту функцию в приложении.',
      'status': 'in_progress',
      'priority': 'medium',
      'created_at': '2025-10-02 12:15',
      'replies': [
        {
          'id': 1,
          'message': 'Здравствуйте! Функция оплаты реализована и доступна для использования.',
          'admin_name': 'Администратор',
          'created_at': '2025-10-02 13:00',
        },
      ],
    },
    {
      'id': 3,
      'user_name': 'Петр Козлов',
      'user_email': 'petr@example.com',
      'subject': 'Предложение по улучшению',
      'message': 'Было бы здорово добавить возможность сохранения видео в избранное.',
      'status': 'closed',
      'priority': 'low',
      'created_at': '2025-10-01 16:45',
      'replies': [
        {
          'id': 1,
          'message': 'Спасибо за предложение! Эта функция уже реализована в последней версии приложения.',
          'admin_name': 'Администратор',
          'created_at': '2025-10-01 17:30',
        },
      ],
    },
  ];

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Colors.blue),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Заголовок и статистика
                  _buildHeader(),
                  const SizedBox(height: 24.0),
                  
                  // Фильтры
                  _buildFilters(),
                  const SizedBox(height: 16.0),
                  
                  // Список обращений
                  _buildTicketsList(),
                ],
              ),
            ),
    );
  }

  Widget _buildHeader() {
    final openTickets = _supportTickets.where((t) => t['status'] == 'open').length;
    final inProgressTickets = _supportTickets.where((t) => t['status'] == 'in_progress').length;
    final closedTickets = _supportTickets.where((t) => t['status'] == 'closed').length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Поддержка пользователей',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16.0),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Новые',
                openTickets.toString(),
                Colors.red,
                Icons.new_releases,
              ),
            ),
            const SizedBox(width: 12.0),
            Expanded(
              child: _buildStatCard(
                'В работе',
                inProgressTickets.toString(),
                Colors.orange,
                Icons.work,
              ),
            ),
            const SizedBox(width: 12.0),
            Expanded(
              child: _buildStatCard(
                'Закрытые',
                closedTickets.toString(),
                Colors.green,
                Icons.check_circle,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String count, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 30),
          const SizedBox(height: 12.0),
          Text(
            count,
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8.0),
          Text(
            title,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[400],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[600]!),
      ),
      child: Row(
        children: [
          Icon(Icons.filter_list, color: Colors.blue),
          const SizedBox(width: 12.0),
          Text(
            'Фильтры:',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 12.0),
          _buildFilterChip('Все', true),
          const SizedBox(width: 8.0),
          _buildFilterChip('Новые', false),
          const SizedBox(width: 8.0),
          _buildFilterChip('В работе', false),
          const SizedBox(width: 8.0),
          _buildFilterChip('Закрытые', false),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 12.0,
        vertical: 8.0,
      ),
      decoration: BoxDecoration(
        color: isSelected ? Colors.blue : Colors.transparent,
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(
          color: isSelected ? Colors.blue : Colors.grey[600]!,
        ),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: isSelected ? Colors.white : Colors.grey[400],
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
    );
  }

  Widget _buildTicketsList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Обращения',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16.0),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _supportTickets.length,
          itemBuilder: (context, index) {
            final ticket = _supportTickets[index];
            return _buildTicketCard(ticket);
          },
        ),
      ],
    );
  }

  Widget _buildTicketCard(Map<String, dynamic> ticket) {
    final status = ticket['status'] as String;
    final priority = ticket['priority'] as String;
    
    Color statusColor;
    String statusText;
    switch (status) {
      case 'open':
        statusColor = Colors.red;
        statusText = 'Новое';
        break;
      case 'in_progress':
        statusColor = Colors.orange;
        statusText = 'В работе';
        break;
      case 'closed':
        statusColor = Colors.green;
        statusText = 'Закрыто';
        break;
      default:
        statusColor = Colors.grey;
        statusText = 'Неизвестно';
    }

    Color priorityColor;
    switch (priority) {
      case 'high':
        priorityColor = Colors.red;
        break;
      case 'medium':
        priorityColor = Colors.orange;
        break;
      case 'low':
        priorityColor = Colors.green;
        break;
      default:
        priorityColor = Colors.grey;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[600]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Заголовок тикета
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ticket['subject'],
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8.0),
                    Row(
                      children: [
                        Icon(Icons.person, color: Colors.blue, size: 16),
                        const SizedBox(width: 8.0),
                        Text(
                          ticket['user_name'],
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.blue,
                          ),
                        ),
                        const SizedBox(width: 12.0),
                        Icon(Icons.email, color: Colors.grey[400], size: 16),
                        const SizedBox(width: 8.0),
                        Text(
                          ticket['user_email'],
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[400],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12.0,
                      vertical: 8.0,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    child: Text(
                      statusText,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8.0),
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: priorityColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16.0),
          
          // Сообщение
          Text(
            ticket['message'],
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 16.0),
          
          // Ответы
          if (ticket['replies'].isNotEmpty) ...[
            Text(
              'Ответы:',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12.0),
            ...ticket['replies'].map<Widget>((reply) => Container(
              margin: const EdgeInsets.only(bottom: 12.0),
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: Colors.blue.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8.0),
                border: Border.all(color: Colors.blue.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        reply['admin_name'],
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.blue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        reply['created_at'],
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[400],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8.0),
                  Text(
                    reply['message'],
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            )).toList(),
          ],
          
          // Поле ответа (только для открытых тикетов)
          if (status != 'closed') ...[
            const SizedBox(height: 16.0),
            TextField(
              controller: _replyController,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Написать ответ...',
                hintStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[400],
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(color: Colors.grey[600]!),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(color: Colors.grey[600]!),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: const BorderSide(color: Colors.blue),
                ),
                contentPadding: const EdgeInsets.all(12.0),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 12.0),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _sendReply(ticket['id']),
                    icon: const Icon(Icons.send, size: 18),
                    label: const Text('Отправить ответ'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12.0),
                ElevatedButton.icon(
                  onPressed: () => _closeTicket(ticket['id']),
                  icon: const Icon(Icons.close, size: 18),
                  label: const Text('Закрыть'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 12.0,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
              ],
            ),
          ],
          
          // Время создания
          const SizedBox(height: 12.0),
          Text(
            'Создано: ${ticket['created_at']}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[400],
            ),
          ),
        ],
      ),
    );
  }

  void _sendReply(int ticketId) {
    if (_replyController.text.trim().isEmpty) return;

    setState(() {
      final ticketIndex = _supportTickets.indexWhere((t) => t['id'] == ticketId);
      if (ticketIndex != -1) {
        _supportTickets[ticketIndex]['replies'].add({
          'id': DateTime.now().millisecondsSinceEpoch,
          'message': _replyController.text.trim(),
          'admin_name': 'Администратор',
          'created_at': DateTime.now().toString().substring(0, 16),
        });
        _supportTickets[ticketIndex]['status'] = 'in_progress';
      }
    });

    _replyController.clear();
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Ответ отправлен для тикета #$ticketId'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _closeTicket(int ticketId) {
    setState(() {
      final ticketIndex = _supportTickets.indexWhere((t) => t['id'] == ticketId);
      if (ticketIndex != -1) {
        _supportTickets[ticketIndex]['status'] = 'closed';
      }
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Тикет #$ticketId закрыт'),
        backgroundColor: Colors.green,
      ),
    );
  }
}

