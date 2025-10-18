import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../models/audio_info.dart';

class AudioInfoModal extends ConsumerStatefulWidget {
  final int? videoId;

  const AudioInfoModal({
    super.key,
    this.videoId,
  });

  @override
  ConsumerState<AudioInfoModal> createState() => _AudioInfoModalState();
}

class _AudioInfoModalState extends ConsumerState<AudioInfoModal>
    with TickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  late TabController _tabController;
  
  List<AudioInfo> _audioTracks = [];
  List<AudioInfo> _filteredTracks = [];
  bool _isLoading = false;
  String? _error;
  int _selectedCategoryIndex = 0;

  final List<String> _categories = [
    'Популярные',
    'Новые',
    'Тренды',
    'Классика',
    'Электронная',
    'Рок',
    'Поп',
    'Джаз',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _categories.length, vsync: this);
    _loadAudioTracks();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAudioTracks() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Load audio tracks from API
      // final apiService = ref.read(apiServiceProvider);
      // final tracks = await apiService.getAudioTracks();
      
      // Пока используем моковые данные
      await Future.delayed(const Duration(milliseconds: 500));
      
      final fallbackTracks = _generateFallbackAudioTracks();
      
      setState(() {
        _audioTracks = fallbackTracks;
        _filteredTracks = fallbackTracks;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  List<AudioInfo> _generateFallbackAudioTracks() {
    return List.generate(20, (index) {
      final categories = ['Мебель', 'Дизайн', 'Интерьер', 'Мастерская'];
      final artists = ['Исполнитель A', 'Исполнитель B', 'Исполнитель C', 'Исполнитель D'];
      
      return AudioInfo(
        id: index + 1,
        title: 'Трек ${index + 1}',
        artist: artists[index % artists.length],
        duration: 30 + (index % 180), // от 30 до 210 секунд
        category: categories[index % categories.length],
        previewUrl: 'assets/audio/preview_${index + 1}.mp3',
        isPopular: index < 5,
        createdAt: DateTime.now().subtract(Duration(days: index)),
      );
    });
  }

  void _filterTracks(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredTracks = _audioTracks;
      } else {
        _filteredTracks = _audioTracks
            .where((track) =>
                track.title.toLowerCase().contains(query.toLowerCase()) ||
                track.artist.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  void _filterByCategory(int categoryIndex) {
    setState(() {
      _selectedCategoryIndex = categoryIndex;
      final category = _categories[categoryIndex];
      
      if (category == 'Популярные') {
        _filteredTracks = _audioTracks.where((track) => track.isPopular).toList();
      } else if (category == 'Новые') {
        _filteredTracks = _audioTracks..sort((a, b) => b.createdAt.compareTo(a.createdAt));
      } else {
        _filteredTracks = _audioTracks
            .where((track) => track.category == category)
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.grey[100]!,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(12.0),
        ),
      ),
      child: Column(
        children: [
          // Заголовок
          Container(
            padding: const EdgeInsets.all(24.0),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Colors.grey[300]!),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Аудио библиотека',
                  style: Theme.of(context).textTheme.headlineSmall.copyWith(
                    color: Colors.white,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.close,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),

          // Поиск
          Container(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Поиск треков и звуков...',
                hintStyle: const TextStyle(color: Colors.grey[600]),
                prefixIcon: const Icon(Icons.search, color: Colors.blue),
                filled: true,
                fillColor: Colors.grey[100]!,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide.none,
                ),
              ),
              style: const TextStyle(color: Colors.white),
              onChanged: _filterTracks,
            ),
          ),

          // Категории
          Container(
            height: 50,
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final isSelected = index == _selectedCategoryIndex;
                return GestureDetector(
                  onTap: () => _filterByCategory(index),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8.0),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 8.0,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.blue : Colors.grey[100]!,
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    child: Center(
                      child: Text(
                        _categories[index],
                        style: Theme.of(context).textTheme.labelMedium.copyWith(
                          color: isSelected ? AppTheme.textOnPrimary : Colors.grey[600],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 16.0),

          // Список аудио
          Expanded(
            child: _buildAudioList(),
          ),
        ],
      ),
    );
  }

  Widget _buildAudioList() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.blue),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: AppTheme.error, size: 64),
            const SizedBox(height: 16.0),
            Text('Ошибка загрузки: $_error', style: AppTheme.bodyMedium),
            const SizedBox(height: 16.0),
            ElevatedButton(
              onPressed: _loadAudioTracks,
              child: const Text('Повторить'),
            ),
          ],
        ),
      );
    }

    if (_filteredTracks.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.music_note, color: Colors.grey[600], size: 64),
            const SizedBox(height: 16.0),
            Text(
              'Аудио не найдено',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8.0),
            Text(
              'Попробуйте изменить поисковый запрос',
              style: AppTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      itemCount: _filteredTracks.length,
      itemBuilder: (context, index) {
        final track = _filteredTracks[index];
        return _buildAudioItem(track, index == 0); // Первый трек "играет"
      },
    );
  }

  Widget _buildAudioItem(AudioInfo track, bool isPlaying) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8.0),
      decoration: BoxDecoration(
        color: Colors.grey[100]!,
        borderRadius: BorderRadius.circular(8.0),
        border: isPlaying 
            ? Border.all(color: Colors.blue, width: 2)
            : null,
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16.0),
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: Colors.blue.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(AppTheme.radiusS),
          ),
          child: Icon(
            isPlaying ? Icons.pause : Icons.play_arrow,
            color: Colors.blue,
          ),
        ),
        title: Text(
          track.title,
          style: AppTheme.titleMedium.copyWith(
            color: Colors.white,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              track.artist,
              style: AppTheme.bodyMedium.copyWith(
                color: Colors.grey[600],
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AppTheme.spacingXS),
            Row(
              children: [
                if (track.isPopular) ...[
                  const Icon(Icons.trending_up, color: AppTheme.accent, size: 16),
                  const SizedBox(width: AppTheme.spacingXS),
                ],
                Text(
                  _formatDuration(track.duration),
                  style: AppTheme.bodySmall.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: IconButton(
          onPressed: () => _useAudioTrack(track),
          icon: const Icon(Icons.add, color: Colors.blue),
        ),
        onTap: () => _playPreview(track),
      ),
    );
  }

  void _playPreview(AudioInfo track) {
    // Implement audio preview
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Предпросмотр: ${track.title}'),
        backgroundColor: Colors.blue,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
      ),
    );
  }

  void _useAudioTrack(AudioInfo track) {
    // Apply audio to video
    Navigator.pop(context, track);
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Аудио "${track.title}" добавлено к видео'),
        backgroundColor: AppTheme.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
      ),
    );
  }
}
