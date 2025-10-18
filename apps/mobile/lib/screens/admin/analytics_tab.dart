import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';

// Таб аналитики в админ-панели
class AnalyticsTab extends ConsumerStatefulWidget {
  const AnalyticsTab({super.key});

  @override
  ConsumerState<AnalyticsTab> createState() => _AnalyticsTabState();
}

class _AnalyticsTabState extends ConsumerState<AnalyticsTab> {
  String _selectedPeriod = 'week';
  bool _isLoading = false;

  // Analytics data
  final Map<String, dynamic> _analyticsData = {
    'users': {
      'total': 15420,
      'new_today': 127,
      'active_today': 3240,
      'growth': 12.5,
    },
    'videos': {
      'total': 8934,
      'uploaded_today': 45,
      'total_views': 2456789,
      'growth': 8.3,
    },
    'orders': {
      'total': 1234,
      'completed_today': 23,
      'total_revenue': 456789.50,
      'growth': 15.7,
    },
    'requests': {
      'total': 567,
      'active': 89,
      'completed_today': 12,
      'growth': 6.2,
    },
  };

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
                  // Фильтр периода
                  _buildPeriodFilter(),
                  const SizedBox(height: 24.0),
                  
                  // Основные метрики
                  _buildMainMetrics(),
                  const SizedBox(height: 24.0),
                  
                  // Графики
                  _buildCharts(),
                  const SizedBox(height: 24.0),
                  
                  // Топ контент
                  _buildTopContent(),
                ],
              ),
            ),
    );
  }

  Widget _buildPeriodFilter() {
    return Container(
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[600]!),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildPeriodButton('day', 'День'),
          _buildPeriodButton('week', 'Неделя'),
          _buildPeriodButton('month', 'Месяц'),
          _buildPeriodButton('year', 'Год'),
        ],
      ),
    );
  }

  Widget _buildPeriodButton(String period, String label) {
    final isSelected = _selectedPeriod == period;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedPeriod = period;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 16.0,
          vertical: 12.0,
        ),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue : Colors.transparent,
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: isSelected ? Colors.white : Colors.grey[400],
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildMainMetrics() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Основные показатели',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16.0),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 12.0,
          mainAxisSpacing: 12.0,
          childAspectRatio: 1.5,
          children: [
            _buildMetricCard(
              'Пользователи',
              _analyticsData['users']['total'].toString(),
              '+${_analyticsData['users']['new_today']} сегодня',
              _analyticsData['users']['growth'],
              Icons.people,
            ),
            _buildMetricCard(
              'Видео',
              _analyticsData['videos']['total'].toString(),
              '+${_analyticsData['videos']['uploaded_today']} сегодня',
              _analyticsData['videos']['growth'],
              Icons.video_library,
            ),
            _buildMetricCard(
              'Заказы',
              _analyticsData['orders']['total'].toString(),
              '+${_analyticsData['orders']['completed_today']} сегодня',
              _analyticsData['orders']['growth'],
              Icons.shopping_cart,
            ),
            _buildMetricCard(
              'Заявки',
              _analyticsData['requests']['total'].toString(),
              '${_analyticsData['requests']['active']} активных',
              _analyticsData['requests']['growth'],
              Icons.assignment,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricCard(String title, String value, String subtitle, double growth, IconData icon) {
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
          Row(
            children: [
              Icon(icon, color: Colors.blue, size: 20),
              const SizedBox(width: 8.0),
              Expanded(
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[400],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12.0),
          Text(
            value,
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8.0),
          Row(
            children: [
              Icon(
                growth > 0 ? Icons.trending_up : Icons.trending_down,
                color: growth > 0 ? Colors.green : Colors.red,
                size: 16,
              ),
              const SizedBox(width: 4.0),
              Text(
                '${growth > 0 ? '+' : ''}${growth.toStringAsFixed(1)}%',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: growth > 0 ? Colors.green : Colors.red,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[400],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCharts() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Графики активности',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16.0),
        Container(
          height: 200,
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.grey[800],
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(color: Colors.grey[600]!),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Активность пользователей',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12.0,
                      vertical: 8.0,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.blue.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    child: Text(
                      'Последние 7 дней',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.blue,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16.0),
              Expanded(
                child: Center(
                  child: Text(
                    '📊 График активности\n(Интеграция с charts_flutter)',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[400],
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTopContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Топ контент',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16.0),
        Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.grey[800],
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(color: Colors.grey[600]!),
          ),
          child: Column(
            children: [
              _buildTopContentItem(
                'Кухонный гарнитур "Модерн"',
                'Мастер Иван',
                '15.2K просмотров',
                '1.2K лайков',
                Icons.video_library,
              ),
              Divider(color: Colors.grey[600]),
              _buildTopContentItem(
                'Диван-кровать трансформер',
                'Мастер Анна',
                '12.8K просмотров',
                '980 лайков',
                Icons.video_library,
              ),
              Divider(color: Colors.grey[600]),
              _buildTopContentItem(
                'Шкаф-купе на заказ',
                'Мастер Петр',
                '9.5K просмотров',
                '756 лайков',
                Icons.video_library,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTopContentItem(String title, String author, String views, String likes, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.blue.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8.0),
            ),
            child: Icon(icon, color: Colors.blue),
          ),
          const SizedBox(width: 12.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4.0),
                Text(
                  author,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[400],
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                views,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4.0),
              Text(
                likes,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.blue,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
