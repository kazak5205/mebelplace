import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_chip.dart';
import '../../../feed/domain/entities/video_entity.dart';
import '../providers/advanced_search_provider.dart';

class AdvancedSearchScreen extends ConsumerStatefulWidget {
  const AdvancedSearchScreen({super.key});

  @override
  ConsumerState<AdvancedSearchScreen> createState() => _AdvancedSearchScreenState();
}

class _AdvancedSearchScreenState extends ConsumerState<AdvancedSearchScreen> {
  final _searchController = TextEditingController();
  final _focusNode = FocusNode();
  
  String? _selectedRegion;
  String? _selectedCategory;
  int? _selectedMinRating;
  String _selectedSortBy = 'relevance';

  final List<String> _regions = [
    'Алматы',
    'Астана',
    'Шымкент',
    'Караганда',
    'Актобе',
  ];

  final List<String> _categories = [
    'Мебель',
    'Ремонт',
    'Дизайн',
    'Декор',
    'Освещение',
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      ref.read(searchSuggestionsProvider.notifier).getSuggestions(_searchController.text);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _performSearch() {
    if (_searchController.text.isEmpty) return;

    final filters = SearchFilters(
      region: _selectedRegion,
      category: _selectedCategory,
      minRating: _selectedMinRating,
      sortBy: _selectedSortBy,
    );

    ref.read(advancedSearchProvider.notifier).search(
      _searchController.text,
      filters: filters,
    );

    ref.read(searchSuggestionsProvider.notifier).addToHistory(_searchController.text);
    _focusNode.unfocus();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final suggestionsState = ref.watch(searchSuggestionsProvider);
    final searchState = ref.watch(advancedSearchProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Search bar
            Padding(
              padding: const EdgeInsets.all(16),
              child: GlassPanel(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back),
                      onPressed: () => Navigator.pop(context),
                      color: isDark ? Colors.white : Colors.black,
                    ),
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        focusNode: _focusNode,
                        autofocus: true,
                        decoration: InputDecoration(
                          hintText: 'Поиск мастеров, видео...',
                          border: InputBorder.none,
                          hintStyle: TextStyle(
                            color: isDark ? Colors.white54 : Colors.black54,
                          ),
                        ),
                        style: TextStyle(
                          color: isDark ? Colors.white : Colors.black,
                        ),
                        textInputAction: TextInputAction.search,
                        onSubmitted: (_) => _performSearch(),
                      ),
                    ),
                    if (_searchController.text.isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _searchController.clear();
                        },
                        color: isDark ? Colors.white : Colors.black,
                      ),
                    IconButton(
                      icon: const Icon(Icons.search),
                      onPressed: _performSearch,
                      color: LiquidGlassColors.primaryOrange,
                    ),
                  ],
                ),
              ),
            ),

            // Filters
            SizedBox(
              height: 50,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  _buildFilterChip(
                    'Регион',
                    _selectedRegion,
                    Icons.location_on,
                    () => _showRegionSelector(),
                  ),
                  const SizedBox(width: 8),
                  _buildFilterChip(
                    'Категория',
                    _selectedCategory,
                    Icons.category,
                    () => _showCategorySelector(),
                  ),
                  const SizedBox(width: 8),
                  _buildFilterChip(
                    'Рейтинг',
                    _selectedMinRating != null ? '$_selectedMinRating+' : null,
                    Icons.star,
                    () => _showRatingSelector(),
                  ),
                  const SizedBox(width: 8),
                  _buildSortChip(),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // Content
            Expanded(
              child: _focusNode.hasFocus
                  ? _buildSuggestions(suggestionsState, isDark)
                  : _buildResults(searchState, isDark),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(
    String label,
    String? value,
    IconData icon,
    VoidCallback onTap,
  ) {
    final hasValue = value != null;

    return GestureDetector(
      onTap: onTap,
      child: GlassChip(
        label: hasValue ? '$label: $value' : label,
        icon: icon,
        isActive: hasValue,
        onTap: onTap,
      ),
    );
  }

  Widget _buildSortChip() {
    final sortLabels = {
      'relevance': 'По релевантности',
      'date': 'По дате',
      'rating': 'По рейтингу',
      'price': 'По цене',
    };

    return GestureDetector(
      onTap: _showSortSelector,
      child: GlassChip(
        label: sortLabels[_selectedSortBy] ?? 'Сортировка',
        icon: Icons.sort,
        isActive: _selectedSortBy != 'relevance',
        onTap: _showSortSelector,
      ),
    );
  }

  Widget _buildSuggestions(SearchSuggestionsState state, bool isDark) {
    if (state is SearchSuggestionsLoaded) {
      return ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          if (state.recentSearches.isNotEmpty) ...[
            Text(
              'Недавние поиски',
              style: LiquidGlassTextStyles.h3Light(isDark),
            ),
            const SizedBox(height: 12),
            ...state.recentSearches.map((search) => _buildSuggestionItem(search, Icons.history)),
            const SizedBox(height: 24),
          ],
          if (state.suggestions.isNotEmpty) ...[
            Text(
              'Предложения',
              style: LiquidGlassTextStyles.h3Light(isDark),
            ),
            const SizedBox(height: 12),
            ...state.suggestions.map((suggestion) => _buildSuggestionItem(suggestion, Icons.search)),
          ],
        ],
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildSuggestionItem(String text, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: LiquidGlassColors.primaryOrange, size: 20),
      title: Text(text),
      onTap: () {
        _searchController.text = text;
        _performSearch();
      },
    );
  }

  Widget _buildResults(AdvancedSearchState state, bool isDark) {
    return switch (state) {
      AdvancedSearchInitial() => _buildEmptyState(isDark),
      AdvancedSearchLoading() => const Center(
          child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange),
        ),
      AdvancedSearchError(:final message) => Center(child: Text(message)),
      AdvancedSearchLoaded(:final videos, :final masters) => 
        _buildResultsList(videos, masters, isDark),
    };
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search,
            size: 80,
            color: isDark ? Colors.white24 : Colors.black12,
          ),
          const SizedBox(height: 16),
          Text(
            'Начните поиск',
            style: LiquidGlassTextStyles.h3Light(isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsList(List<VideoEntity> videos, List<MasterSearchResult> masters, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (masters.isNotEmpty) ...[
          Text('Мастера', style: LiquidGlassTextStyles.h3Light(isDark)),
          const SizedBox(height: 12),
          ...masters.map((master) => _buildMasterCard(master, isDark)),
          const SizedBox(height: 24),
        ],
        if (videos.isNotEmpty) ...[
          Text('Видео', style: LiquidGlassTextStyles.h3Light(isDark)),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              childAspectRatio: 9 / 16,
            ),
            itemCount: videos.length,
            itemBuilder: (context, index) => _buildVideoThumbnail(videos[index]),
          ),
        ],
      ],
    );
  }

  Widget _buildMasterCard(MasterSearchResult master, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassPanel(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: LiquidGlassColors.primaryOrange,
                  child: Text(
                    master.name.substring(0, 1).toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontSize: 20),
                  ),
                ),
                if (master.isOnline)
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: LiquidGlassColors.success,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.black, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    master.name,
                    style: TextStyle(
                      color: isDark ? Colors.white : Colors.black,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star, size: 14, color: LiquidGlassColors.warning),
                      const SizedBox(width: 4),
                      Text(
                        '${master.rating.toStringAsFixed(1)} • ${master.subscribersCount} подписчиков',
                        style: TextStyle(
                          color: isDark ? Colors.white70 : Colors.black54,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  if (master.region != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      master.region!,
                      style: TextStyle(
                        color: isDark ? Colors.white70 : Colors.black54,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoThumbnail(VideoEntity video) {
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, '/video/${video.id}');
      },
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              video.thumbnailUrl ?? '',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(color: Colors.grey),
            ),
            Positioned(
              bottom: 4,
              left: 4,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.visibility, size: 10, color: Colors.white),
                    const SizedBox(width: 2),
                    Text(
                      '${video.viewsCount}',
                      style: const TextStyle(color: Colors.white, fontSize: 10),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showRegionSelector() async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => _buildSelectorSheet('Выберите регион', _regions),
    );
    if (selected != null) {
      setState(() => _selectedRegion = selected);
      _performSearch();
    }
  }

  Future<void> _showCategorySelector() async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => _buildSelectorSheet('Выберите категорию', _categories),
    );
    if (selected != null) {
      setState(() => _selectedCategory = selected);
      _performSearch();
    }
  }

  Future<void> _showRatingSelector() async {
    final selected = await showModalBottomSheet<int>(
      context: context,
      builder: (context) => _buildRatingSheet(),
    );
    if (selected != null) {
      setState(() => _selectedMinRating = selected);
      _performSearch();
    }
  }

  Future<void> _showSortSelector() async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => _buildSelectorSheet(
        'Сортировать',
        ['relevance', 'date', 'rating', 'price'],
        labels: {
          'relevance': 'По релевантности',
          'date': 'По дате',
          'rating': 'По рейтингу',
          'price': 'По цене',
        },
      ),
    );
    if (selected != null) {
      setState(() => _selectedSortBy = selected);
      _performSearch();
    }
  }

  Widget _buildSelectorSheet(
    String title,
    List<String> items, {
    Map<String, String>? labels,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          ...items.map((item) => ListTile(
                title: Text(labels?[item] ?? item),
                onTap: () => Navigator.pop(context, item),
              )),
        ],
      ),
    );
  }

  Widget _buildRatingSheet() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Минимальный рейтинг', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          ...List.generate(5, (index) {
            final rating = 5 - index;
            return ListTile(
              leading: Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(
                  rating,
                  (i) => const Icon(Icons.star, color: LiquidGlassColors.warning, size: 20),
                ),
              ),
              title: Text('$rating+'),
              onTap: () => Navigator.pop(context, rating),
            );
          }),
        ],
      ),
    );
  }
}

