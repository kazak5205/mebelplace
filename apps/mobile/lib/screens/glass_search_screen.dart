import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';
import '../core/widgets/glass/glass_text_field.dart';
import '../core/widgets/glass/glass_chip.dart';
import '../core/widgets/glass/glass_panel.dart';
import '../core/theme/liquid_glass_colors.dart';
import '../features/search/presentation/providers/search_provider.dart';
import '../features/search/presentation/providers/search_state.dart';

/// Glass Search Screen
class GlassSearchScreen extends ConsumerStatefulWidget {
  const GlassSearchScreen({super.key});

  @override
  ConsumerState<GlassSearchScreen> createState() => _GlassSearchScreenState();
}

class _GlassSearchScreenState extends ConsumerState<GlassSearchScreen> {
  final _searchController = TextEditingController();
  String _activeFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header с поиском
            Padding(
              padding: const EdgeInsets.all(16),
              child: GlassSearchField(
                hint: 'Поиск видео, мастеров...',
                controller: _searchController,
                onChanged: (value) {
                  ref.read(searchProvider.notifier).search(query: value);
                },
                onClear: () {
                  _searchController.clear();
                  ref.read(searchProvider.notifier).search(query: '');
                },
              ),
            ),

            // Фильтры (чипы)
            SizedBox(
              height: 50,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  GlassChip(
                    label: 'Все',
                    isActive: _activeFilter == 'all',
                    onTap: () => setState(() => _activeFilter = 'all'),
                  ),
                  const SizedBox(width: 8),
                  GlassChip(
                    label: 'Мастера',
                    icon: Icons.person_outline,
                    isActive: _activeFilter == 'masters',
                    onTap: () => setState(() => _activeFilter = 'masters'),
                  ),
                  const SizedBox(width: 8),
                  GlassChip(
                    label: 'Видео',
                    icon: Icons.video_library_outlined,
                    isActive: _activeFilter == 'videos',
                    onTap: () => setState(() => _activeFilter = 'videos'),
                  ),
                  const SizedBox(width: 8),
                  GlassChip(
                    label: 'Товары',
                    icon: Icons.shopping_bag_outlined,
                    isActive: _activeFilter == 'products',
                    onTap: () => setState(() => _activeFilter = 'products'),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Результаты
            Expanded(
              child: Consumer(
                builder: (context, ref, child) {
                  final searchState = ref.watch(searchProvider);
                  
                  if (searchState is SearchInitial) {
                    return Center(
                      child: Text(
                        'Начните поиск',
                        style: TextStyle(
                          color: isDark ? Colors.white : Colors.black,
                        ),
                      ),
                    );
                  }
                  
                  if (searchState is SearchLoading) {
                    return const Center(
                      child: CircularProgressIndicator(
                        color: LiquidGlassColors.primaryOrange,
                      ),
                    );
                  }
                  
                  if (searchState is SearchLoaded) {
                    final results = searchState.results;
                      if (results.isEmpty) {
                        return Center(
                          child: Text(
                            'Ничего не найдено',
                            style: TextStyle(
                              color: isDark ? Colors.white : Colors.black,
                            ),
                          ),
                        );
                      }
                      
                      return GridView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 0.75,
                        ),
                        itemCount: results.length,
                        itemBuilder: (context, index) {
                          final result = results[index];
                          
                          return GestureDetector(
                            onTap: () {
                              // Navigate to result
                              Navigator.pushNamed(
                                context,
                                '/video/${result.id}',
                                arguments: result,
                              );
                            },
                            child: GlassPanel(
                              padding: EdgeInsets.zero,
                              borderRadius: 16,
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(16),
                                    child: Image.network(
                                      result.imageUrl ?? '',
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stack) {
                                        return Container(
                                          color: Colors.grey[800],
                                          child: const Icon(Icons.video_library_outlined, size: 48, color: Colors.white70),
                                        );
                                      },
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    child: ClipRRect(
                                      borderRadius: const BorderRadius.only(
                                        bottomLeft: Radius.circular(16),
                                        bottomRight: Radius.circular(16),
                                      ),
                                      child: BackdropFilter(
                                        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                                        child: Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: Colors.black.withValues(alpha: 0.3),
                                          ),
                                          child: Text(
                                            result.title,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 14,
                                              fontWeight: FontWeight.w500,
                                            ),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    }
                  
                  if (searchState is SearchError) {
                    return Center(
                      child: Text(
                        (searchState as SearchError).message,
                        style: const TextStyle(color: Colors.red),
                      ),
                    );
                  }
                  
                  return const SizedBox.shrink();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
