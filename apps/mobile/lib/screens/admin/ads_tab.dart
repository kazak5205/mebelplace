import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';

// Таб рекламы в админ-панели
class AdsTab extends ConsumerStatefulWidget {
  const AdsTab({super.key});

  @override
  ConsumerState<AdsTab> createState() => _AdsTabState();
}

class _AdsTabState extends ConsumerState<AdsTab> {
  bool _isLoading = false;

  // Ad videos data
  final List<Map<String, dynamic>> _adVideos = [
    {
      'id': 1,
      'title': 'Скидка 20% на кухни',
      'description': 'Акция на изготовление кухонных гарнитуров',
      'views': 15420,
      'clicks': 892,
      'budget': 50000,
      'status': 'active',
      'created_at': '2025-09-28',
    },
    {
      'id': 2,
      'title': 'Новая коллекция диванов',
      'description': 'Презентация новых моделей мягкой мебели',
      'views': 8934,
      'clicks': 456,
      'budget': 30000,
      'status': 'paused',
      'created_at': '2025-09-25',
    },
  ];

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
                  // Заголовок и кнопка добавления
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Рекламные кампании',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      ElevatedButton.icon(
                        onPressed: _showAddAdDialog,
                        icon: const Icon(Icons.add, size: 18),
                        label: const Text('Добавить'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
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
                  const SizedBox(height: 24.0),

                  // Статистика рекламы
                  _buildAdStats(),
                  const SizedBox(height: 24.0),

                  // Список рекламных кампаний
                  _buildAdCampaigns(),
                ],
              ),
            ),
    );
  }

  Widget _buildAdStats() {
    return Container(
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
            'Общая статистика',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16.0),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Показы',
                  '24.3K',
                  '+12.5%',
                  Icons.visibility,
                  Colors.blue,
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: _buildStatCard(
                  'Клики',
                  '1.3K',
                  '+8.7%',
                  Icons.mouse,
                  Colors.green,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12.0),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'CTR',
                  '5.4%',
                  '+2.1%',
                  Icons.trending_up,
                  Colors.blue,
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: _buildStatCard(
                  'Бюджет',
                  '80K ₸',
                  '-5.2%',
                  Icons.attach_money,
                  Colors.purple,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, String change, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 8.0),
              Text(
                title,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[400],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12.0),
          Text(
            value,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8.0),
          Text(
            change,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: change.startsWith('+') ? Colors.green : Colors.red,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdCampaigns() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Активные кампании',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16.0),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _adVideos.length,
          itemBuilder: (context, index) {
            final ad = _adVideos[index];
            return _buildAdCard(ad);
          },
        ),
      ],
    );
  }

  Widget _buildAdCard(Map<String, dynamic> ad) {
    final isActive = ad['status'] == 'active';
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(
          color: isActive ? Colors.blue.withValues(alpha: 0.5) : Colors.grey[600]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 60,
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
                      ad['title'],
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      ad['description'],
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
                  color: isActive ? Colors.green.withValues(alpha: 0.1) : Colors.orange.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Text(
                  isActive ? 'Активна' : 'Пауза',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isActive ? Colors.green : Colors.orange,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16.0),
          
          // Статистика кампании
          Row(
            children: [
              Expanded(
                child: _buildAdMetric('Показы', '${ad['views']}', Icons.visibility),
              ),
              Expanded(
                child: _buildAdMetric('Клики', '${ad['clicks']}', Icons.mouse),
              ),
              Expanded(
                child: _buildAdMetric('Бюджет', '${ad['budget']} ₸', Icons.attach_money),
              ),
            ],
          ),
          const SizedBox(height: 16.0),
          
          // Действия
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _toggleAdStatus(ad['id']),
                  icon: Icon(
                    isActive ? Icons.pause : Icons.play_arrow,
                    size: 18,
                  ),
                  label: Text(isActive ? 'Пауза' : 'Запустить'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isActive ? Colors.orange : Colors.green,
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
                onPressed: () => _editAd(ad['id']),
                icon: const Icon(Icons.edit, size: 18),
                label: const Text('Изменить'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
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
              const SizedBox(width: 12.0),
              ElevatedButton.icon(
                onPressed: () => _deleteAd(ad['id']),
                icon: const Icon(Icons.delete, size: 18),
                label: const Text('Удалить'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
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
      ),
    );
  }

  Widget _buildAdMetric(String title, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.blue, size: 20),
        const SizedBox(height: 8.0),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4.0),
        Text(
          title,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Colors.grey[400],
          ),
        ),
      ],
    );
  }

  void _showAddAdDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[800],
        title: Text(
          'Добавить рекламу',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white),
        ),
        content: Text(
          'Функция добавления рекламы будет реализована в следующей версии.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[400]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'OK',
              style: TextStyle(color: Colors.blue),
            ),
          ),
        ],
      ),
    );
  }

  void _toggleAdStatus(int adId) {
    setState(() {
      final adIndex = _adVideos.indexWhere((ad) => ad['id'] == adId);
      if (adIndex != -1) {
        _adVideos[adIndex]['status'] = 
            _adVideos[adIndex]['status'] == 'active' ? 'paused' : 'active';
      }
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Статус рекламы #$adId изменен'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _editAd(int adId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Редактирование рекламы #$adId'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _deleteAd(int adId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[800],
        title: Text(
          'Удалить рекламу',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white),
        ),
        content: Text(
          'Вы уверены, что хотите удалить эту рекламную кампанию?',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[400]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Отмена',
              style: TextStyle(color: Colors.grey[400]),
            ),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _adVideos.removeWhere((ad) => ad['id'] == adId);
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Реклама #$adId удалена'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            child: Text(
              'Удалить',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}

