import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/story_entity.dart';
import '../providers/stories_provider.dart';
import '../screens/story_viewer_screen.dart';
import '../screens/create_story_screen.dart';
import 'story_ring.dart';
import '../../../../../../../core/theme/liquid_glass_colors.dart';

/// Stories horizontal bar (like Instagram)
class StoriesBar extends ConsumerStatefulWidget {
  const StoriesBar({super.key});

  @override
  ConsumerState<StoriesBar> createState() => _StoriesBarState();
}

class _StoriesBarState extends ConsumerState<StoriesBar> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(storiesProvider.notifier).loadStories();
    });
  }

  @override
  Widget build(BuildContext context) {
    final storiesState = ref.watch(storiesProvider);

    return Container(
      height: 110,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: switch (storiesState) {
        StoriesInitial() || StoriesLoading() => const Center(
            child: SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: LiquidGlassColors.primaryOrange,
              ),
            ),
          ),
        StoriesError() => const SizedBox.shrink(),
        StoriesLoaded(:final storyGroups) => _buildStoriesList(storyGroups),
      },
    );
  }

  Widget _buildStoriesList(List<StoryGroup> storyGroups) {
    return ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      itemCount: storyGroups.length + 1, // +1 for "Add story" button
      itemBuilder: (context, index) {
        if (index == 0) {
          return _buildAddStoryButton();
        }

        final storyGroup = storyGroups[index - 1];
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6),
          child: StoryRing(
            storyGroup: storyGroup,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => StoryViewerScreen(
                    storyGroup: storyGroup,
                    initialIndex: 0,
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildAddStoryButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: GestureDetector(
        onTap: () async {
          final result = await Navigator.push<bool>(
            context,
            MaterialPageRoute(
              builder: (context) => const CreateStoryScreen(),
            ),
          );

          // Reload stories if new story was created
          if (result == true && mounted) {
            ref.read(storiesProvider.notifier).loadStories();
          }
        },
        child: SizedBox(
          width: 72,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      LiquidGlassColors.primaryOrange.withValues(alpha: 0.3),
                      LiquidGlassColors.primaryOrangeLight.withValues(alpha: 0.3),
                    ],
                  ),
                  border: Border.all(
                    color: LiquidGlassColors.primaryOrange,
                    width: 2,
                  ),
                ),
                child: const Icon(
                  Icons.add,
                  size: 32,
                  color: LiquidGlassColors.primaryOrange,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Ваша история',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w400,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}


