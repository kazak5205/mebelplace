import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_chip.dart';
import '../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../feed/domain/entities/video_entity.dart';
import '../../../auth/domain/entities/public_user_entity.dart';
import '../../../../core/config/api_config.dart';

class HashtagSearchScreen extends ConsumerStatefulWidget {
  final String? initialHashtag;

  const HashtagSearchScreen({super.key, this.initialHashtag});

  @override
  ConsumerState<HashtagSearchScreen> createState() => _HashtagSearchScreenState();
}

class _HashtagSearchScreenState extends ConsumerState<HashtagSearchScreen> {
  final _searchController = TextEditingController();
  final _storage = const FlutterSecureStorage();
  List<String> _trendingHashtags = [];
  List<VideoEntity> _hashtagVideos = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialHashtag != null) {
      _searchController.text = widget.initialHashtag!;
      _searchHashtag(widget.initialHashtag!);
    }
    _loadTrendingHashtags();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadTrendingHashtags() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/search/hashtags/trending'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _trendingHashtags = (data['hashtags'] as List<dynamic>)
              .map((h) => h['name'] as String)
              .toList();
        });
      }
    } catch (e) {
      debugPrint('Error loading trending hashtags: $e');
    }
  }

  Future<void> _searchHashtag(String hashtag) async {
    if (hashtag.trim().isEmpty) return;

    setState(() => _isLoading = true);

    try {
      final token = await _storage.read(key: 'auth_token');
      
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/search/hashtags/$hashtag'),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        setState(() {
          _hashtagVideos = (data['videos'] as List<dynamic>)
              .map((v) => VideoEntity(
                    id: v['id'] as int,
                    userId: v['user_id'] as int,
                    title: v['title'] as String,
                    description: v['description'] as String?,
                    path: v['path'] as String,
                    thumbnailPath: v['thumbnail_path'] as String?,
                    thumbnailUrl: v['thumbnail_path'] as String?,
                    sizeBytes: v['size_bytes'] as int,
                    hashtags: (v['hashtags'] as List<dynamic>?)?.map((h) => h as String).toList() ?? [],
                    viewsCount: v['views_count'] as int,
                    likesCount: v['likes_count'] as int,
                    commentsCount: v['comments_count'] as int,
                    sharesCount: v['shares_count'] as int,
                    productPrice: (v['product_price'] as num?)?.toDouble(),
                    productDescription: v['product_description'] as String?,
                    isProduct: v['is_product'] as bool? ?? false,
                    isAd: v['is_ad'] as bool? ?? false,
                    isLiked: v['is_liked'] as bool? ?? false,
                    isFavorite: v['is_favorite'] as bool? ?? false,
                    isFollowing: v['is_following'] as bool? ?? false,
                    createdAt: DateTime.parse(v['created_at'] as String),
                    author: PublicUser(
                      id: v['author']['id'] as int,
                      username: v['author']['username'] as String,
                      avatarUrl: v['author']['avatar_url'] as String?,
                      bio: v['author']['bio'] as String?,
                      isOnline: v['author']['is_online'] as bool? ?? false,
                      lastSeen: v['author']['last_seen'] != null
                          ? DateTime.parse(v['author']['last_seen'] as String)
                          : null,
                    ),
                  ))
              .toList();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка поиска: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: TextField(
          controller: _searchController,
          style: TextStyle(color: isDark ? Colors.white : Colors.black),
          decoration: InputDecoration(
            hintText: 'Поиск по хештегу...',
            hintStyle: TextStyle(color: isDark ? Colors.white54 : Colors.black54),
            prefixIcon: const Icon(Icons.tag),
            suffixIcon: IconButton(
              icon: const Icon(Icons.search),
              onPressed: () => _searchHashtag(_searchController.text),
            ),
            border: InputBorder.none,
          ),
          onSubmitted: _searchHashtag,
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Trending hashtags
          if (_trendingHashtags.isNotEmpty) ...[
            Text(
              'Популярные хештеги',
              style: LiquidGlassTextStyles.h3Light(isDark),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _trendingHashtags.map((tag) {
                return GlassChip(
                  label: '#$tag',
                  onTap: () {
                    _searchController.text = tag;
                    _searchHashtag(tag);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
          ],

          // Search results
          if (_isLoading)
            const Center(child: CircularProgressIndicator())
          else if (_hashtagVideos.isNotEmpty) ...[
            Text(
              'Найдено видео: ${_hashtagVideos.length}',
              style: LiquidGlassTextStyles.h3Light(isDark),
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.7,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: _hashtagVideos.length,
              itemBuilder: (context, index) {
                final video = _hashtagVideos[index];
                return GestureDetector(
                  onTap: () => Navigator.pushNamed(
                    context,
                    '/video/${video.id}',
                    arguments: video,
                  ),
                  child: GlassPanel(
                    padding: EdgeInsets.zero,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                            child: Image.network(
                              video.thumbnailUrl ?? '',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: Colors.grey[800],
                                  child: const Icon(Icons.video_library, size: 48),
                                );
                              },
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                video.title,
                                style: const TextStyle(fontWeight: FontWeight.bold),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.favorite, size: 14),
                                  const SizedBox(width: 4),
                                  Text('${video.likesCount}'),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ] else if (_searchController.text.isNotEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(48),
                child: Text(
                  'Ничего не найдено по #${_searchController.text}',
                  style: LiquidGlassTextStyles.body.copyWith(
                    color: isDark ? Colors.white54 : Colors.black54,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

