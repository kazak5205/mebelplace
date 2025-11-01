import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_helper.dart';
import '../../../data/models/video_model.dart';
import '../../providers/app_providers.dart';
import '../../providers/repository_providers.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/tiktok_video_player.dart';

class MasterChannelPage extends ConsumerStatefulWidget {
  final String masterId;
  
  const MasterChannelPage({
    super.key,
    required this.masterId,
  });

  @override
  ConsumerState<MasterChannelPage> createState() => _MasterChannelPageState();
}

class _MasterChannelPageState extends ConsumerState<MasterChannelPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoadingUser = true;
  String? _masterName;
  String? _masterAvatar;
  String? _masterBio;
  String? _masterCompanyType;
  int _videosCount = 0;
  int _followersCount = 0;
  bool _isFollowing = false;
  String? _userError;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    // Загружаем информацию о мастере и его видео
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(videoProvider.notifier).loadMasterVideos(widget.masterId);
      _loadMasterInfo();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadMasterInfo() async {
    try {
      setState(() {
        _isLoadingUser = true;
        _userError = null;
      });

      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.getUser(widget.masterId);

      if (mounted && response.success && response.data != null) {
        final user = response.data!;
        setState(() {
          _masterName = user.displayName;
          _masterAvatar = user.avatar;
          _masterBio = user.bio;
          _masterCompanyType = user.companyType;
          _followersCount = user.followersCount ?? 0;
          _isLoadingUser = false;
        });
        
        // Загружаем статус подписки
        _loadSubscriptionStatus();
      } else {
        if (mounted) {
          setState(() {
            _userError = response.message ?? 'Ошибка загрузки профиля';
            _isLoadingUser = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _userError = e.toString();
          _isLoadingUser = false;
        });
      }
    }
  }

  Future<void> _loadSubscriptionStatus() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.getSubscriptionStatus(widget.masterId);
      
      if (mounted && response.success && response.data != null) {
        setState(() {
          _isFollowing = response.data!['isSubscribed'] ?? false;
        });
      }
    } catch (e) {
      // Игнорируем ошибку, просто не покажем статус подписки
    }
  }

  Future<void> _toggleSubscribe() async {
    final apiService = ref.read(apiServiceProvider);
    
    try {
      if (_isFollowing) {
        await apiService.unsubscribeFromUser(widget.masterId);
        if (mounted) {
          setState(() {
            _isFollowing = false;
            _followersCount = (_followersCount - 1).clamp(0, 999999);
          });
        }
      } else {
        await apiService.subscribeToUser(widget.masterId);
        if (mounted) {
          setState(() {
            _isFollowing = true;
            _followersCount++;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final videoState = ref.watch(videoProvider);
    final videos = videoState.videos.where((v) => v.authorId == widget.masterId).toList();
    
    // Обновляем количество видео
    if (_videosCount != videos.length) {
      Future.microtask(() {
        if (mounted) {
          setState(() {
            _videosCount = videos.length;
          });
        }
      });
    }
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: _isLoadingUser
          ? const Center(child: LoadingWidget())
          : _userError != null
              ? _buildErrorWidget(_userError!)
              : CustomScrollView(
                  slivers: [
                    // TikTok-style header
                    _buildSliverAppBar(),
                    
                    // Profile info
                    SliverToBoxAdapter(
                      child: _buildProfileInfo(),
                    ),
                    
                    // Tab bar
                    SliverPersistentHeader(
                      pinned: true,
                      delegate: _SliverTabBarDelegate(
                        TabBar(
                          controller: _tabController,
                          indicatorColor: AppColors.primary,
                          indicatorWeight: 2,
                          labelColor: Colors.white,
                          unselectedLabelColor: Colors.white.withOpacity(0.5),
                          tabs: const [
                            Tab(icon: Icon(Icons.video_library_rounded)),
                            Tab(icon: Icon(Icons.favorite_rounded)),
                          ],
                        ),
                      ),
                    ),
                    
                    // Videos grid
                    videoState.isLoading
                        ? const SliverToBoxAdapter(
                            child: Center(
                              child: Padding(
                                padding: EdgeInsets.all(40),
                                child: LoadingWidget(),
                              ),
                            ),
                          )
                        : videos.isEmpty
                            ? SliverToBoxAdapter(
                                child: _buildEmptyVideos(),
                              )
                            : SliverGrid(
                                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 3, // ✅ 3 колонки как на вебе
                                  childAspectRatio: 9 / 16,
                                  crossAxisSpacing: 1,
                                  mainAxisSpacing: 1,
                                ),
                                delegate: SliverChildBuilderDelegate(
                                  (context, index) {
                                    return _buildVideoThumbnail(videos[index], index);
                                  },
                                  childCount: videos.length,
                                ),
                              ),
                  ],
                ),
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 0,
      pinned: true,
      backgroundColor: Colors.black,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text(
        _masterName ?? 'Канал мастера',
        style: TextStyle(
          color: Colors.white,
          fontSize: 16.sp,
          fontWeight: FontWeight.w600,
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.more_vert, color: Colors.white),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildProfileInfo() {
    return Container(
      color: Colors.black,
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 20.h),
      child: Column(
        children: [
          // Avatar
          Hero(
            tag: 'master_avatar_${widget.masterId}',
            child: Container(
              width: 100.w,
              height: 100.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.secondary],
                ),
              ),
              padding: EdgeInsets.all(3.w),
              child: ClipOval(
                child: ImageHelper.hasValidImagePath(_masterAvatar)
                    ? CachedNetworkImage(
                        imageUrl: ImageHelper.getFullImageUrl(_masterAvatar),
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: AppColors.darkSurface,
                          child: Icon(
                            Icons.person,
                            size: 50.sp,
                            color: Colors.white.withOpacity(0.5),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.darkSurface,
                          child: Icon(
                            Icons.person,
                            size: 50.sp,
                            color: Colors.white.withOpacity(0.5),
                          ),
                        ),
                      )
                    : Container(
                        color: AppColors.darkSurface,
                        child: Icon(
                          Icons.person,
                          size: 50.sp,
                          color: Colors.white.withOpacity(0.5),
                        ),
                      ),
              ),
            ),
          ),
          
          SizedBox(height: 16.h),
          
          // Name
          Text(
            '@${_masterName ?? 'master'}',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          
          SizedBox(height: 8.h),
          
          // Company Type Badge
          Container(
            padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4.r),
              border: Border.all(
                color: _getCompanyTypeBorderColor(_masterCompanyType),
                width: 1,
              ),
              color: _getCompanyTypeBgColor(_masterCompanyType),
            ),
            child: Text(
              _getCompanyTypeLabel(_masterCompanyType),
              style: TextStyle(
                color: _getCompanyTypeTextColor(_masterCompanyType),
                fontSize: 10.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          
          SizedBox(height: 8.h),
          
          // Bio
          if (_masterBio != null && _masterBio!.isNotEmpty)
            Text(
              _masterBio!,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white.withOpacity(0.7),
              ),
            ),
          
          SizedBox(height: 20.h),
          
          // Stats
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildStat('Подписчики', _followersCount.toString()),
              SizedBox(width: 40.w),
              _buildStat('Видео', _videosCount.toString()),
            ],
          ),
          
          SizedBox(height: 20.h),
          
          // Action buttons (Follow + Write like on web строка 403-450)
          Row(
            children: [
              // Follow/Subscribe button
              Expanded(
                child: ElevatedButton(
                  onPressed: _toggleSubscribe,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isFollowing 
                        ? Colors.white.withOpacity(0.2)
                        : AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4.r),
                      side: _isFollowing
                          ? BorderSide(color: Colors.white.withOpacity(0.3))
                          : BorderSide.none,
                    ),
                  ),
                  child: Text(
                    _isFollowing ? 'Подписан' : 'Подписаться',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              SizedBox(width: 12.w),
              // Write message button
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pushNamed(context, '/messages', arguments: {'userId': widget.masterId});
                },
                icon: Icon(Icons.message, size: 18.sp),
                label: Text('Написать'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.1),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4.r),
                    side: BorderSide(color: Colors.white.withOpacity(0.2)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          label,
          style: TextStyle(
            fontSize: 12.sp,
            color: Colors.white.withOpacity(0.6),
          ),
        ),
      ],
    );
  }

  Widget _buildVideoThumbnail(VideoModel video, int index) {
    return GestureDetector(
      onTap: () {
        // Открываем видео-плеер с этого видео
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => TikTokVideoPlayer(
              videos: ref.read(videoProvider).videos.where((v) => v.authorId == widget.masterId).toList(),
              initialIndex: index,
              mutedByDefault: true, // ✅ Звук по умолчанию выключен
              onLike: (video) {
                ref.read(videoProvider.notifier).likeVideo(video.id);
              },
            ),
          ),
        );
      },
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Thumbnail
          if (ImageHelper.hasValidImagePath(video.thumbnailUrl))
            CachedNetworkImage(
              imageUrl: ImageHelper.getFullImageUrl(video.thumbnailUrl),
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                color: Colors.grey[900],
              ),
              errorWidget: (context, url, error) => Container(
                color: Colors.grey[900],
                child: const Icon(
                  Icons.play_circle_outline,
                  color: Colors.white,
                  size: 40,
                ),
              ),
            )
          else
            Container(
              color: Colors.grey[900],
              child: const Icon(
                Icons.play_circle_outline,
                color: Colors.white,
                size: 40,
              ),
            ),
          
          // Views count
          Positioned(
            bottom: 4,
            left: 4,
            child: Row(
              children: [
                const Icon(
                  Icons.play_arrow,
                  color: Colors.white,
                  size: 14,
                ),
                const SizedBox(width: 2),
                Text(
                  _formatViews(video.views),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    shadows: [
                      Shadow(
                        color: Colors.black,
                        blurRadius: 4,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyVideos() {
    return Container(
      padding: EdgeInsets.all(40.w),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.video_library_outlined,
              size: 80.sp,
              color: Colors.white.withOpacity(0.3),
            ),
            SizedBox(height: 16.h),
            Text(
              'Пока нет видео',
              style: TextStyle(
                fontSize: 16.sp,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorWidget(String error) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(40.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 80.sp,
              color: Colors.red.withOpacity(0.7),
            ),
            SizedBox(height: 24.h),
            Text(
              'Ошибка загрузки',
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white.withOpacity(0.6),
              ),
            ),
            SizedBox(height: 32.h),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: EdgeInsets.symmetric(horizontal: 32.w, vertical: 16.h),
              ),
              child: const Text('Назад'),
            ),
          ],
        ),
      ),
    );
  }

  String _formatViews(int views) {
    if (views >= 1000000) {
      return '${(views / 1000000).toStringAsFixed(1)}M';
    } else if (views >= 1000) {
      return '${(views / 1000).toStringAsFixed(1)}K';
    }
    return views.toString();
  }

  // ✅ Company Type Helper методы (как на вебе companyTypes.ts)
  String _getCompanyTypeLabel(String? type) {
    if (type == null) return 'Мастер';
    switch (type) {
      case 'company':
        return 'Мебельная компания';
      case 'shop':
        return 'Мебельный магазин';
      case 'master':
      default:
        return 'Мастер';
    }
  }

  Color _getCompanyTypeBgColor(String? type) {
    if (type == null) return Colors.yellow.withValues(alpha: 0.2);
    switch (type) {
      case 'company':
        return Colors.orange.withValues(alpha: 0.2);
      case 'shop':
        return Colors.red.withValues(alpha: 0.2);
      case 'master':
      default:
        return Colors.yellow.withValues(alpha: 0.2);
    }
  }

  Color _getCompanyTypeTextColor(String? type) {
    if (type == null) return Colors.yellow[400]!;
    switch (type) {
      case 'company':
        return Colors.orange[400]!;
      case 'shop':
        return Colors.red[400]!;
      case 'master':
      default:
        return Colors.yellow[400]!;
    }
  }

  Color _getCompanyTypeBorderColor(String? type) {
    if (type == null) return Colors.yellow.withValues(alpha: 0.3);
    switch (type) {
      case 'company':
        return Colors.orange.withValues(alpha: 0.3);
      case 'shop':
        return Colors.red.withValues(alpha: 0.3);
      case 'master':
      default:
        return Colors.yellow.withValues(alpha: 0.3);
    }
  }
}

class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;

  _SliverTabBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(
      color: Colors.black,
      child: _tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) {
    return false;
  }
}
