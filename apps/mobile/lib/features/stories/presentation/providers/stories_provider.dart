import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../domain/entities/story_entity.dart';
import '../../data/models/story_model.dart';
import '../../../../core/config/api_config.dart';

sealed class StoriesState {}

class StoriesInitial extends StoriesState {}

class StoriesLoading extends StoriesState {}

class StoriesLoaded extends StoriesState {
  final List<StoryGroup> storyGroups;

  StoriesLoaded(this.storyGroups);
}

class StoriesError extends StoriesState {
  final String message;
  StoriesError(this.message);
}

class StoriesNotifier extends StateNotifier<StoriesState> {
  final _storage = const FlutterSecureStorage();

  StoriesNotifier() : super(StoriesInitial());

  Future<void> loadStories() async {
    state = StoriesLoading();

    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) {
        state = StoriesError('Not authenticated');
        return;
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/stories'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> storiesData = data['stories'] ?? [];

        // Group stories by author
        final Map<String, List<StoryEntity>> groupedStories = {};
        
        for (final storyJson in storiesData) {
          final story = StoryModel.fromJson(storyJson).toEntity();
          
          // Skip expired stories
          if (story.isExpired && !story.isHighlight) continue;
          
          if (!groupedStories.containsKey(story.authorId)) {
            groupedStories[story.authorId] = [];
          }
          groupedStories[story.authorId]!.add(story);
        }

        // Convert to story groups
        final storyGroups = groupedStories.entries.map((entry) {
          final stories = entry.value;
          final hasUnviewed = stories.any((s) => !s.isViewed);
          
          return StoryGroup(
            authorId: entry.key,
            authorName: stories.first.authorName,
            authorAvatar: stories.first.authorAvatar,
            stories: stories,
            hasUnviewed: hasUnviewed,
          );
        }).toList();

        // Sort: unviewed first
        storyGroups.sort((a, b) {
          if (a.hasUnviewed && !b.hasUnviewed) return -1;
          if (!a.hasUnviewed && b.hasUnviewed) return 1;
          return 0;
        });

        state = StoriesLoaded(storyGroups);
      } else {
        state = StoriesError('Failed to load stories: ${response.statusCode}');
      }
    } catch (e) {
      state = StoriesError('Error loading stories: $e');
    }
  }

  Future<void> markAsViewed(String storyId) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/stories/$storyId/view'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      // Update local state
      if (state is StoriesLoaded) {
        final loaded = state as StoriesLoaded;
        final updatedGroups = loaded.storyGroups.map((group) {
          final updatedStories = group.stories.map((story) {
            if (story.id == storyId) {
              return story.copyWith(
                isViewed: true,
                viewsCount: story.viewsCount + 1,
              );
            }
            return story;
          }).toList();

          final hasUnviewed = updatedStories.any((s) => !s.isViewed);

          return StoryGroup(
            authorId: group.authorId,
            authorName: group.authorName,
            authorAvatar: group.authorAvatar,
            stories: updatedStories,
            hasUnviewed: hasUnviewed,
          );
        }).toList();

        state = StoriesLoaded(updatedGroups);
      }
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> deleteStory(String storyId) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      final response = await http.delete(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/stories/$storyId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        // Reload stories
        await loadStories();
      }
    } catch (e) {
      // Handle error
    }
  }

  Future<void> addToHighlights(String storyId, String highlightName) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return;

      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/stories/$storyId/highlight'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'highlight_name': highlightName,
        }),
      );

      // Reload stories
      await loadStories();
    } catch (e) {
      // Handle error
    }
  }
}

final storiesProvider = StateNotifierProvider<StoriesNotifier, StoriesState>((ref) {
  return StoriesNotifier();
});


