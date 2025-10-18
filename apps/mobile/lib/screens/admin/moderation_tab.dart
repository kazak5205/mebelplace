import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';

// Таб модерации в админ-панели
class ModerationTab extends ConsumerStatefulWidget {
  const ModerationTab({super.key});

  @override
  ConsumerState<ModerationTab> createState() => _ModerationTabState();
}

class _ModerationTabState extends ConsumerState<ModerationTab> with TickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;

  // Moderation data
  final List<Map<String, dynamic>> _pendingUsers = [
    {
      'id': 1,
      'name': 'Иван Петров',
      'email': 'ivan@example.com',
      'role': 'master',
      'created_at': '2025-10-01',
      'status': 'pending',
    },
    {
      'id': 2,
      'name': 'Анна Сидорова',
      'email': 'anna@example.com',
      'role': 'master',
      'created_at': '2025-10-02',
      'status': 'pending',
    },
  ];

  final List<Map<String, dynamic>> _pendingVideos = [
    {
      'id': 1,
      'title': 'Кухонный гарнитур на заказ',
      'author': 'Мастер Иван',
      'duration': '2:30',
      'uploaded_at': '2025-10-02',
      'status': 'pending',
    },
    {
      'id': 2,
      'title': 'Реставрация старой мебели',
      'author': 'Мастер Анна',
      'duration': '3:45',
      'uploaded_at': '2025-10-02',
      'status': 'pending',
    },
  ];

  final List<Map<String, dynamic>> _pendingRequests = [
    {
      'id': 1,
      'title': 'Нужен шкаф-купе',
      'description': 'Требуется изготовление шкафа-купе по индивидуальным размерам',
      'author': 'Покупатель 1',
      'region': 'Алматы',
      'created_at': '2025-10-02',
      'status': 'pending',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      body: Column(
        children: [
          // Табы модерации
          Container(
            margin: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: Colors.grey[800],
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: Colors.grey[600]!),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: Colors.blue,
                borderRadius: BorderRadius.circular(12.0),
              ),
              labelColor: Colors.white,
              unselectedLabelColor: Colors.grey[400],
              labelStyle: Theme.of(context).textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w600),
              tabs: const [
                Tab(text: 'Пользователи'),
                Tab(text: 'Видео'),
                Tab(text: 'Заявки'),
              ],
            ),
          ),

          // Контент табов
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildUsersTab(),
                _buildVideosTab(),
                _buildRequestsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUsersTab() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      itemCount: _pendingUsers.length,
      itemBuilder: (context, index) {
        final user = _pendingUsers[index];
        return _buildUserCard(user);
      },
    );
  }

  Widget _buildUserCard(Map<String, dynamic> user) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[600]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 25,
                backgroundColor: Colors.blue,
                child: Text(
                  user['name'][0].toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user['name'],
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      user['email'],
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[400],
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12.0,
                  vertical: 8.0,
                ),
                decoration: BoxDecoration(
                  color: user['role'] == 'master' ? Colors.blue.withValues(alpha: 0.1) : Colors.blue.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Text(
                  user['role'] == 'master' ? 'Мастер' : 'Покупатель',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: user['role'] == 'master' ? Colors.blue : Colors.blue,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16.0),
          Text(
            'Дата регистрации: ${user['created_at']}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 16.0),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _approveUser(user['id']),
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('Одобрить'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _rejectUser(user['id']),
                  icon: const Icon(Icons.close, size: 18),
                  label: const Text('Отклонить'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVideosTab() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      itemCount: _pendingVideos.length,
      itemBuilder: (context, index) {
        final video = _pendingVideos[index];
        return _buildVideoCard(video);
      },
    );
  }

  Widget _buildVideoCard(Map<String, dynamic> video) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[600]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 80,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: const Icon(
                  Icons.play_arrow,
                  color: Colors.blue,
                  size: 30,
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      video['title'],
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      video['author'],
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[400],
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      'Длительность: ${video['duration']}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[400],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16.0),
          Text(
            'Загружено: ${video['uploaded_at']}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 16.0),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _approveVideo(video['id']),
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('Одобрить'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _rejectVideo(video['id']),
                  icon: const Icon(Icons.close, size: 18),
                  label: const Text('Отклонить'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRequestsTab() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      itemCount: _pendingRequests.length,
      itemBuilder: (context, index) {
        final request = _pendingRequests[index];
        return _buildRequestCard(request);
      },
    );
  }

  Widget _buildRequestCard(Map<String, dynamic> request) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[600]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            request['title'],
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12.0),
          Text(
            request['description'],
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 16.0),
          Row(
            children: [
              Icon(Icons.person, color: Colors.blue, size: 16),
              const SizedBox(width: 8.0),
              Text(
                request['author'],
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.blue,
                ),
              ),
              const SizedBox(width: 16.0),
              Icon(Icons.location_on, color: Colors.blue, size: 16),
              const SizedBox(width: 8.0),
              Text(
                request['region'],
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.blue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12.0),
          Text(
            'Создано: ${request['created_at']}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 16.0),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _approveRequest(request['id']),
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('Одобрить'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _rejectRequest(request['id']),
                  icon: const Icon(Icons.close, size: 18),
                  label: const Text('Отклонить'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _approveUser(int userId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Пользователь #$userId одобрен'),
        backgroundColor: Colors.green,
      ),
    );
    setState(() {
      _pendingUsers.removeWhere((user) => user['id'] == userId);
    });
  }

  void _rejectUser(int userId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Пользователь #$userId отклонен'),
        backgroundColor: Colors.red,
      ),
    );
    setState(() {
      _pendingUsers.removeWhere((user) => user['id'] == userId);
    });
  }

  void _approveVideo(int videoId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Видео #$videoId одобрено'),
        backgroundColor: Colors.green,
      ),
    );
    setState(() {
      _pendingVideos.removeWhere((video) => video['id'] == videoId);
    });
  }

  void _rejectVideo(int videoId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Видео #$videoId отклонено'),
        backgroundColor: Colors.red,
      ),
    );
    setState(() {
      _pendingVideos.removeWhere((video) => video['id'] == videoId);
    });
  }

  void _approveRequest(int requestId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Заявка #$requestId одобрена'),
        backgroundColor: Colors.green,
      ),
    );
    setState(() {
      _pendingRequests.removeWhere((request) => request['id'] == requestId);
    });
  }

  void _rejectRequest(int requestId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Заявка #$requestId отклонена'),
        backgroundColor: Colors.red,
      ),
    );
    setState(() {
      _pendingRequests.removeWhere((request) => request['id'] == requestId);
    });
  }
}
